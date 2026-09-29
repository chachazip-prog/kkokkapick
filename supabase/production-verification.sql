-- Read-only production verification queries.
-- Run with a privileged operator connection after migrations; do not expose this file as a public RPC.
begin read only;

select to_regprocedure('public.get_published_catalog(integer,integer)') is not null as catalog_rpc_present;
select to_regprocedure('public.get_my_app_data()') is not null as account_read_rpc_present;
select to_regprocedure('public.sync_my_app_data(uuid[],jsonb,jsonb)') is not null as account_sync_rpc_present;
select to_regprocedure('public.delete_my_account()') is not null as account_delete_rpc_present;
select to_regprocedure('public.record_commercial_event(uuid,text,uuid,text)') is not null as commercial_event_rpc_present;

select relname, relrowsecurity
from pg_class
where relnamespace='public'::regnamespace
  and relname in ('profiles','child_profiles','favorites','price_alerts','push_devices','commercial_events')
order by relname;

select grantee, routine_name, privilege_type
from information_schema.role_routine_grants
where routine_schema='public'
  and routine_name in ('get_published_catalog','get_my_app_data','delete_my_account','record_commercial_event')
order by routine_name, grantee;

rollback;
