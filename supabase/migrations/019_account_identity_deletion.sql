-- 019: privileged account identity deletion boundary.
-- Client must never receive service-role credentials. The authenticated client invokes
-- a narrow security-definer RPC which can delete only auth.uid() after app-owned data.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path=public,auth
as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'authentication required'; end if;

  -- Explicit cleanup keeps lifecycle behavior deterministic even if FK policies change.
  delete from public.price_alerts where user_id=uid;
  delete from public.favorites where user_id=uid;
  delete from public.child_profiles where user_id=uid;
  delete from public.profiles where id=uid;

  -- The definer may delete only the caller's own identity; no arbitrary user id parameter exists.
  delete from auth.users where id=uid;
  if not found then raise exception 'account identity not found'; end if;
end $$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

comment on function public.delete_my_account() is
  'Deletes app-owned data and the currently authenticated auth.users identity only.';
