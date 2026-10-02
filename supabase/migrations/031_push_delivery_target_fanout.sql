-- 031: per-device push delivery fan-out and trusted worker boundary.
-- One price alert observation may target multiple installations. Track each device
-- independently so a retry never resends to a device that already succeeded.

create table if not exists public.price_alert_delivery_targets (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.price_alert_deliveries(id) on delete cascade,
  device_id uuid references public.push_devices(id) on delete set null,
  platform text not null check(platform in ('ios','android')),
  status text not null default 'pending' check(status in ('pending','processing','sent','failed')),
  attempt_count integer not null default 0 check(attempt_count>=0),
  next_attempt_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(delivery_id,device_id)
);
alter table public.price_alert_delivery_targets enable row level security;
-- No client policy: device delivery targets are service-role only.

create index if not exists price_alert_delivery_targets_ready_idx
  on public.price_alert_delivery_targets(next_attempt_at,created_at)
  where status='pending';

create index if not exists price_alert_delivery_targets_processing_idx
  on public.price_alert_delivery_targets(claimed_at)
  where status='processing';

create or replace function public.claim_price_alert_delivery_targets(
  p_limit integer default 100,
  p_stale_after interval default interval '15 minutes',
  p_max_attempts integer default 5,
  p_platform text default null
)
returns table(
  target_id uuid,
  delivery_id uuid,
  user_id uuid,
  product_id uuid,
  observed_price integer,
  device_id uuid,
  platform text,
  token text,
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
  if p_platform is not null and p_platform not in ('ios','android') then
    raise exception 'unsupported platform';
  end if;

  -- Freeze the active device set the first time a parent delivery is processed.
  insert into public.price_alert_delivery_targets(delivery_id,device_id,platform)
  select d.id,pd.id,pd.platform
  from public.price_alert_deliveries d
  join public.price_alerts a on a.id=d.alert_id
  join public.push_devices pd on pd.user_id=a.user_id and pd.enabled
  where d.status='pending'
  on conflict(delivery_id,device_id) do nothing;

  -- A delivery with no active installation cannot be sent. Keep a bounded code only.
  update public.price_alert_deliveries d
  set status='failed',
      claimed_at=null,
      last_error='no_enabled_push_device'
  where d.status='pending'
    and not exists (
      select 1 from public.price_alert_delivery_targets t where t.delivery_id=d.id
    );

  -- A target can become disabled after fan-out but before provider I/O.
  update public.price_alert_delivery_targets t
  set status='failed',
      claimed_at=null,
      last_error='push_device_disabled',
      updated_at=now()
  where t.status='pending'
    and (
      t.device_id is null or
      not exists (
        select 1 from public.push_devices pd
        where pd.id=t.device_id and pd.enabled
      )
    );

  -- Recover abandoned target leases independently so successful sibling devices
  -- are never resent.
  update public.price_alert_delivery_targets
  set status=case when attempt_count>=p_max_attempts then 'failed' else 'pending' end,
      claimed_at=null,
      next_attempt_at=case when attempt_count>=p_max_attempts then next_attempt_at else now() end,
      last_error=case
        when attempt_count>=p_max_attempts then 'delivery_lease_retry_budget_exhausted'
        else 'delivery_lease_retry_scheduled'
      end,
      updated_at=now()
  where status='processing' and claimed_at<now()-p_stale_after;

  return query
  with candidates as (
    select t.id
    from public.price_alert_delivery_targets t
    where t.status='pending'
      and t.next_attempt_at<=now()
      and t.attempt_count<p_max_attempts
      and (p_platform is null or t.platform=p_platform)
    order by t.next_attempt_at,t.created_at,t.id
    for update skip locked
    limit p_limit
  ), claimed as (
    update public.price_alert_delivery_targets t
    set status='processing',
        claimed_at=now(),
        attempt_count=t.attempt_count+1,
        last_error=null,
        updated_at=now()
    from candidates c
    where t.id=c.id
    returning t.id,t.delivery_id,t.device_id,t.platform,t.attempt_count
  ), parents as (
    update public.price_alert_deliveries d
    set status='processing',
        claimed_at=coalesce(d.claimed_at,now()),
        last_error=null
    where d.id in (select distinct c.delivery_id from claimed c)
    returning d.id
  )
  select c.id,c.delivery_id,a.user_id,a.product_id,d.observed_price,
         c.device_id,c.platform,pd.token,c.attempt_count
  from claimed c
  join public.price_alert_deliveries d on d.id=c.delivery_id
  join public.price_alerts a on a.id=d.alert_id
  join public.push_devices pd on pd.id=c.device_id and pd.enabled;
end $$;

create or replace function public.complete_price_alert_delivery_target(
  p_target_id uuid,
  p_success boolean,
  p_retryable boolean default false,
  p_invalid_token boolean default false,
  p_error_code text default null,
  p_max_attempts integer default 5
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  attempts integer;
  parent_id uuid;
  target_device_id uuid;
begin
  if p_target_id is null then raise exception 'target id required'; end if;
  if p_max_attempts<1 or p_max_attempts>10 then raise exception 'max attempts out of range'; end if;

  select t.attempt_count,t.delivery_id,t.device_id
  into attempts,parent_id,target_device_id
  from public.price_alert_delivery_targets t
  where t.id=p_target_id and t.status='processing'
  for update;

  if not found then raise exception 'delivery target is not processing'; end if;

  if p_invalid_token and target_device_id is not null then
    update public.push_devices
    set enabled=false,updated_at=now()
    where id=target_device_id;
  end if;

  update public.price_alert_delivery_targets
  set status=case
        when p_success then 'sent'
        when p_retryable and not p_invalid_token and attempts<p_max_attempts then 'pending'
        else 'failed'
      end,
      sent_at=case when p_success then now() else null end,
      claimed_at=null,
      next_attempt_at=case
        when not p_success and p_retryable and not p_invalid_token and attempts<p_max_attempts
          then now()+make_interval(secs=>least(3600,30*(2^greatest(0,attempts-1)))::integer)
        else next_attempt_at
      end,
      last_error=case
        when p_success then null
        else left(coalesce(nullif(trim(p_error_code),''),'provider_delivery_failed'),120)
      end,
      updated_at=now()
  where id=p_target_id;

  -- Parent is terminal only after every frozen device target is terminal.
  if exists (
    select 1 from public.price_alert_delivery_targets
    where delivery_id=parent_id and status in ('pending','processing')
  ) then
    update public.price_alert_deliveries
    set status='processing'
    where id=parent_id;
  elsif exists (
    select 1 from public.price_alert_delivery_targets
    where delivery_id=parent_id and status='sent'
  ) then
    update public.price_alert_deliveries
    set status='sent',sent_at=coalesce(sent_at,now()),claimed_at=null,last_error=null
    where id=parent_id;
  else
    update public.price_alert_deliveries
    set status='failed',sent_at=null,claimed_at=null,last_error='all_push_targets_failed'
    where id=parent_id;
  end if;
end $$;

-- Old parent-level claim/finalize functions cannot safely represent multi-device
-- partial success. Keep them for migration compatibility but do not grant them
-- to the production service role.
revoke all on function public.claim_price_alert_deliveries(integer,interval,integer)
  from service_role;
revoke all on function public.complete_price_alert_delivery(uuid,boolean,boolean,text,integer)
  from service_role;

revoke all on function public.claim_price_alert_delivery_targets(integer,interval,integer,text)
  from public,anon,authenticated;
revoke all on function public.complete_price_alert_delivery_target(uuid,boolean,boolean,boolean,text,integer)
  from public,anon,authenticated;

grant execute on function public.claim_price_alert_delivery_targets(integer,interval,integer,text)
  to service_role;
grant execute on function public.complete_price_alert_delivery_target(uuid,boolean,boolean,boolean,text,integer)
  to service_role;

comment on table public.price_alert_delivery_targets is
  'Server-only per-device fan-out ledger; prevents retrying targets that already succeeded.';
comment on function public.claim_price_alert_delivery_targets(integer,interval,integer,text) is
  'Service-role atomic claim boundary returning raw push tokens only to the trusted sender.';
comment on function public.complete_price_alert_delivery_target(uuid,boolean,boolean,boolean,text,integer) is
  'Service-role target finalization with bounded retry and invalid-token disablement.';
