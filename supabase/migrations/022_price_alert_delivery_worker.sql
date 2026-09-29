-- 022: server-only price-alert delivery worker boundary.
-- Workers atomically claim pending rows before provider I/O, then finalize success/failure.

alter table public.price_alert_deliveries
  drop constraint if exists price_alert_deliveries_status_check;
alter table public.price_alert_deliveries
  add constraint price_alert_deliveries_status_check
  check(status in ('pending','processing','sent','failed'));

alter table public.price_alert_deliveries
  add column if not exists claimed_at timestamptz,
  add column if not exists attempt_count integer not null default 0 check(attempt_count>=0),
  add column if not exists last_error text;

create index if not exists price_alert_deliveries_pending_idx
  on public.price_alert_deliveries(status,created_at)
  where status='pending';

create or replace function public.claim_price_alert_deliveries(
  p_limit integer default 100,
  p_stale_after interval default interval '15 minutes'
)
returns table(
  delivery_id uuid,
  alert_id uuid,
  user_id uuid,
  product_id uuid,
  observed_price integer
)
language plpgsql
security definer
set search_path=public
as $$
begin
  if p_limit<1 or p_limit>500 then raise exception 'limit out of range'; end if;
  if p_stale_after<interval '1 minute' or p_stale_after>interval '24 hours' then
    raise exception 'stale interval out of range';
  end if;

  -- Recover work abandoned by a crashed worker. Provider integrations must use
  -- delivery_id as their idempotency key where supported.
  update public.price_alert_deliveries
  set status='pending',claimed_at=null
  where status='processing' and claimed_at<now()-p_stale_after;

  return query
  with candidates as (
    select d.id
    from public.price_alert_deliveries d
    where d.status='pending'
    order by d.created_at,d.id
    for update skip locked
    limit p_limit
  ), claimed as (
    update public.price_alert_deliveries d
    set status='processing',
        claimed_at=now(),
        attempt_count=d.attempt_count+1,
        last_error=null
    from candidates c
    where d.id=c.id
    returning d.id,d.alert_id,d.observed_price
  )
  select c.id,c.alert_id,a.user_id,a.product_id,c.observed_price
  from claimed c
  join public.price_alerts a on a.id=c.alert_id;
end $$;

create or replace function public.complete_price_alert_delivery(
  p_delivery_id uuid,
  p_success boolean,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if p_delivery_id is null then raise exception 'delivery id required'; end if;

  update public.price_alert_deliveries
  set status=case when p_success then 'sent' else 'failed' end,
      sent_at=case when p_success then now() else null end,
      claimed_at=null,
      last_error=case when p_success then null else left(coalesce(nullif(trim(p_error),''),'provider delivery failed'),1000) end
  where id=p_delivery_id and status='processing';

  if not found then raise exception 'delivery is not processing'; end if;
end $$;

revoke all on function public.claim_price_alert_deliveries(integer,interval)
  from public,anon,authenticated;
revoke all on function public.complete_price_alert_delivery(uuid,boolean,text)
  from public,anon,authenticated;

comment on function public.claim_price_alert_deliveries(integer,interval) is
  'Trusted-worker atomic claim boundary using SKIP LOCKED; returns work only after marking it processing.';
comment on function public.complete_price_alert_delivery(uuid,boolean,text) is
  'Trusted-worker finalization boundary for provider delivery outcome.';
