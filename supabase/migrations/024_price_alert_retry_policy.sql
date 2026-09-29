-- 024: bounded retry/backoff/dead-letter semantics for price-alert delivery.
-- Provider I/O remains outside Postgres. The worker classifies failures as retryable or terminal.

alter table public.price_alert_deliveries
  add column if not exists next_attempt_at timestamptz not null default now();

create index if not exists price_alert_deliveries_ready_idx
  on public.price_alert_deliveries(next_attempt_at,created_at)
  where status='pending';

create index if not exists price_alert_deliveries_processing_lease_idx
  on public.price_alert_deliveries(claimed_at)
  where status='processing';

create or replace function public.claim_price_alert_deliveries(
  p_limit integer default 100,
  p_stale_after interval default interval '15 minutes',
  p_max_attempts integer default 5
)
returns table(
  delivery_id uuid,
  alert_id uuid,
  user_id uuid,
  product_id uuid,
  observed_price integer,
  attempt_count integer
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
  if p_max_attempts<1 or p_max_attempts>10 then raise exception 'max attempts out of range'; end if;

  -- A crashed worker is retried only while the bounded attempt budget remains.
  update public.price_alert_deliveries
  set status=case when attempt_count>=p_max_attempts then 'failed' else 'pending' end,
      claimed_at=null,
      next_attempt_at=case when attempt_count>=p_max_attempts then next_attempt_at else now() end,
      last_error=case
        when attempt_count>=p_max_attempts then 'delivery lease expired; retry budget exhausted'
        else 'delivery lease expired; retry scheduled'
      end
  where status='processing' and claimed_at<now()-p_stale_after;

  return query
  with candidates as (
    select d.id
    from public.price_alert_deliveries d
    where d.status='pending'
      and d.next_attempt_at<=now()
      and d.attempt_count<p_max_attempts
    order by d.next_attempt_at,d.created_at,d.id
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
    returning d.id,d.alert_id,d.observed_price,d.attempt_count
  )
  select c.id,c.alert_id,a.user_id,a.product_id,c.observed_price,c.attempt_count
  from claimed c
  join public.price_alerts a on a.id=c.alert_id;
end $$;

create or replace function public.complete_price_alert_delivery(
  p_delivery_id uuid,
  p_success boolean,
  p_retryable boolean default false,
  p_error_code text default null,
  p_max_attempts integer default 5
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare attempts integer;
begin
  if p_delivery_id is null then raise exception 'delivery id required'; end if;
  if p_max_attempts<1 or p_max_attempts>10 then raise exception 'max attempts out of range'; end if;

  select attempt_count into attempts
  from public.price_alert_deliveries
  where id=p_delivery_id and status='processing'
  for update;

  if not found then raise exception 'delivery is not processing'; end if;

  update public.price_alert_deliveries
  set status=case
        when p_success then 'sent'
        when p_retryable and attempts<p_max_attempts then 'pending'
        else 'failed'
      end,
      sent_at=case when p_success then now() else null end,
      claimed_at=null,
      next_attempt_at=case
        when not p_success and p_retryable and attempts<p_max_attempts
          then now() + make_interval(secs => least(3600,30 * (2 ^ greatest(0,attempts-1)))::integer)
        else next_attempt_at
      end,
      -- Store a bounded classification/code only. Provider bodies and tokens must not be persisted here.
      last_error=case
        when p_success then null
        else left(coalesce(nullif(trim(p_error_code),''),'provider_delivery_failed'),120)
      end
  where id=p_delivery_id;
end $$;

drop function if exists public.claim_price_alert_deliveries(integer,interval);
drop function if exists public.complete_price_alert_delivery(uuid,boolean,text);

revoke all on function public.claim_price_alert_deliveries(integer,interval,integer)
  from public,anon,authenticated;
revoke all on function public.complete_price_alert_delivery(uuid,boolean,boolean,text,integer)
  from public,anon,authenticated;

comment on function public.claim_price_alert_deliveries(integer,interval,integer) is
  'Trusted-worker claim boundary with bounded attempts, stale-lease recovery and scheduled backoff.';
comment on function public.complete_price_alert_delivery(uuid,boolean,boolean,text,integer) is
  'Trusted-worker finalization boundary; retryable failures return to pending with exponential backoff.';
