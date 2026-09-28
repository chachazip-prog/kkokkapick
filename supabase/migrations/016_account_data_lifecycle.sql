-- 016: account-owned data lifecycle foundation.
-- Authentication provider wiring is intentionally separate; these RPCs operate
-- only for an already-authenticated Supabase user.

alter table public.child_profiles
  add column if not exists updated_at timestamptz not null default now();

alter table public.price_alerts
  add constraint price_alerts_target_price_positive
  check (target_price is null or target_price > 0);

create unique index if not exists child_profiles_one_per_user_idx
  on public.child_profiles(user_id);

create unique index if not exists price_alerts_user_product_unique_idx
  on public.price_alerts(user_id,product_id);

create or replace function public.get_my_app_data()
returns jsonb
language plpgsql security invoker set search_path=public as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'authentication required'; end if;
  return jsonb_build_object(
    'profile',(select to_jsonb(p)-'user_id' from public.child_profiles p where p.user_id=uid limit 1),
    'favoriteProductIds',coalesce((select jsonb_agg(f.product_id order by f.created_at) from public.favorites f where f.user_id=uid),'[]'::jsonb),
    'priceAlerts',coalesce((select jsonb_agg(jsonb_build_object('productId',a.product_id,'targetPrice',a.target_price,'enabled',a.enabled) order by a.created_at) from public.price_alerts a where a.user_id=uid),'[]'::jsonb)
  );
end $$;

create or replace function public.delete_my_app_data()
returns void
language plpgsql security invoker set search_path=public as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'authentication required'; end if;
  delete from public.price_alerts where user_id=uid;
  delete from public.favorites where user_id=uid;
  delete from public.child_profiles where user_id=uid;
end $$;

revoke all on function public.get_my_app_data() from public;
revoke all on function public.delete_my_app_data() from public;
grant execute on function public.get_my_app_data() to authenticated;
grant execute on function public.delete_my_app_data() to authenticated;

comment on function public.delete_my_app_data() is
'Deletes KKOKKAPICK app-owned profile/favorite/alert rows. Auth identity deletion is a separate privileged operation.';
