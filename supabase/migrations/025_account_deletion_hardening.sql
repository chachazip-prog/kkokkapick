-- 025: keep account deletion complete as account-owned tables expand.
-- Push devices are directly user-owned and must be removed before deleting auth.users.
-- Delivery rows cascade through price_alerts and therefore do not need a separate user-id delete.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path=public,auth
as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'authentication required'; end if;

  delete from public.push_devices where user_id=uid;
  delete from public.price_alerts where user_id=uid;
  delete from public.favorites where user_id=uid;
  delete from public.child_profiles where user_id=uid;
  delete from public.profiles where id=uid;

  delete from auth.users where id=uid;
  if not found then raise exception 'account identity not found'; end if;
end $$;

revoke all on function public.delete_my_account() from public,anon;
grant execute on function public.delete_my_account() to authenticated;

comment on function public.delete_my_account() is
  'Deletes current authenticated identity plus all directly account-owned KKOKKAPICK rows, including push tokens.';
