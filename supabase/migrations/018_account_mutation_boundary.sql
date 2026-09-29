-- 018: explicit authenticated account-data mutations.
-- Avoids abusing the additive first-sign-in sync RPC for everyday deletes/updates.

create or replace function public.set_my_favorite(p_product_id uuid,p_favorite boolean)
returns void language plpgsql security invoker set search_path=public as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'authentication required'; end if;
  if p_favorite then
    insert into public.favorites(user_id,product_id) values(uid,p_product_id)
    on conflict (user_id,product_id) do nothing;
  else
    delete from public.favorites where user_id=uid and product_id=p_product_id;
  end if;
end $$;

create or replace function public.set_my_price_alert(p_product_id uuid,p_target_price integer)
returns void language plpgsql security invoker set search_path=public as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'authentication required'; end if;
  if p_target_price is null then
    delete from public.price_alerts where user_id=uid and product_id=p_product_id;
  elsif p_target_price<=0 then
    raise exception 'target price must be positive';
  else
    insert into public.price_alerts(user_id,product_id,target_price,enabled)
    values(uid,p_product_id,p_target_price,true)
    on conflict (user_id,product_id) do update set target_price=excluded.target_price,enabled=true;
  end if;
end $$;

create or replace function public.set_my_child_profile(p_profile jsonb)
returns void language plpgsql security invoker set search_path=public as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'authentication required'; end if;
  if p_profile is null then
    delete from public.child_profiles where user_id=uid;
    return;
  end if;
  insert into public.child_profiles(user_id,nickname,birth_date,height_cm,weight_kg,usual_size,updated_at)
  values(uid,nullif(p_profile->>'nickname',''),nullif(p_profile->>'birthDate','')::date,
    nullif(p_profile->>'heightCm','')::numeric,nullif(p_profile->>'weightKg','')::numeric,
    nullif(p_profile->>'usualSize',''),now())
  on conflict (user_id) do update set nickname=excluded.nickname,birth_date=excluded.birth_date,
    height_cm=excluded.height_cm,weight_kg=excluded.weight_kg,usual_size=excluded.usual_size,updated_at=now();
end $$;

revoke all on function public.set_my_favorite(uuid,boolean) from public;
revoke all on function public.set_my_price_alert(uuid,integer) from public;
revoke all on function public.set_my_child_profile(jsonb) from public;
grant execute on function public.set_my_favorite(uuid,boolean) to authenticated;
grant execute on function public.set_my_price_alert(uuid,integer) to authenticated;
grant execute on function public.set_my_child_profile(jsonb) to authenticated;

comment on function public.set_my_favorite(uuid,boolean) is 'Authenticated idempotent favorite mutation.';
comment on function public.set_my_price_alert(uuid,integer) is 'Authenticated price-alert upsert/delete mutation; null deletes.';
comment on function public.set_my_child_profile(jsonb) is 'Authenticated single child-profile upsert/delete mutation; null deletes.';
