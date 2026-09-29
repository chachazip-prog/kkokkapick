-- 023: prevent stale push-token ownership across account switches.
-- A provider token identifies one app installation and must have at most one active account owner.

-- Collapse any historical duplicate ownership before adding the invariant.
with ranked as (
  select id,
         row_number() over (
           partition by platform,token
           order by enabled desc,updated_at desc,created_at desc,id desc
         ) as rn
  from public.push_devices
)
delete from public.push_devices d
using ranked r
where d.id=r.id and r.rn>1;

alter table public.push_devices
  drop constraint if exists push_devices_user_id_token_key;

create unique index if not exists push_devices_platform_token_uidx
  on public.push_devices(platform,token);

create or replace function public.set_my_push_device(
  p_platform text,
  p_token text,
  p_enabled boolean default true
)
returns void
language plpgsql
security invoker
set search_path=public
as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'authentication required'; end if;
  if p_platform not in ('ios','android') then raise exception 'unsupported platform'; end if;
  if p_token is null or length(trim(p_token))<16 then raise exception 'invalid push token'; end if;

  -- Reassign the installation token to the currently authenticated account.
  -- This prevents notifications for a previous account reaching the same device.
  insert into public.push_devices(user_id,platform,token,enabled,updated_at)
  values(uid,p_platform,trim(p_token),p_enabled,now())
  on conflict(platform,token) do update
    set user_id=excluded.user_id,
        enabled=excluded.enabled,
        updated_at=now();
end $$;

revoke all on function public.set_my_push_device(text,text,boolean) from public;
grant execute on function public.set_my_push_device(text,text,boolean) to authenticated;

comment on index public.push_devices_platform_token_uidx is
  'One app installation push token has one current account owner per platform.';
