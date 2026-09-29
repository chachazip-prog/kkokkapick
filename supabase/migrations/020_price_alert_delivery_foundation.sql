-- 020: price-alert delivery foundation.
-- Device tokens are account-scoped. Evaluation is idempotent per alert + observed offer price.

create table if not exists public.push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check(platform in ('ios','android')),
  token text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,token)
);
alter table public.push_devices enable row level security;
create policy "own push devices" on public.push_devices for all
  using(auth.uid()=user_id) with check(auth.uid()=user_id);

create table if not exists public.price_alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.price_alerts(id) on delete cascade,
  observed_price integer not null check(observed_price>0),
  status text not null default 'pending' check(status in ('pending','sent','failed')),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique(alert_id,observed_price)
);
alter table public.price_alert_deliveries enable row level security;
-- No client policy: delivery queue is server/service-role only.

create or replace function public.set_my_push_device(p_platform text,p_token text,p_enabled boolean default true)
returns void language plpgsql security invoker set search_path=public as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'authentication required'; end if;
  if p_platform not in ('ios','android') then raise exception 'unsupported platform'; end if;
  if p_token is null or length(trim(p_token))<16 then raise exception 'invalid push token'; end if;
  insert into public.push_devices(user_id,platform,token,enabled,updated_at)
  values(uid,p_platform,trim(p_token),p_enabled,now())
  on conflict(user_id,token) do update
    set platform=excluded.platform,enabled=excluded.enabled,updated_at=now();
end $$;
revoke all on function public.set_my_push_device(text,text,boolean) from public;
grant execute on function public.set_my_push_device(text,text,boolean) to authenticated;

create or replace function public.remove_my_push_device(p_token text)
returns void language plpgsql security invoker set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  delete from public.push_devices where user_id=auth.uid() and token=p_token;
end $$;
revoke all on function public.remove_my_push_device(text) from public;
grant execute on function public.remove_my_push_device(text) to authenticated;

comment on table public.price_alert_deliveries is
  'Server-only idempotency ledger for threshold-triggered push delivery.';
