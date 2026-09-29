-- 017: narrow authenticated account-data mutation boundary.
-- Keeps synchronization deterministic without exposing service-role credentials.

create or replace function public.sync_my_app_data(
  p_favorite_product_ids uuid[] default '{}'::uuid[],
  p_profile jsonb default null,
  p_price_alerts jsonb default '[]'::jsonb
) returns jsonb
language plpgsql security invoker set search_path=public as $$
declare
  uid uuid:=auth.uid();
  item jsonb;
begin
  if uid is null then raise exception 'authentication required'; end if;

  insert into public.favorites(user_id,product_id)
  select uid,product_id from unnest(coalesce(p_favorite_product_ids,'{}'::uuid[])) product_id
  on conflict (user_id,product_id) do nothing;

  if p_profile is not null then
    insert into public.child_profiles(user_id,nickname,birth_date,height_cm,weight_kg,usual_size,updated_at)
    values (
      uid,
      nullif(p_profile->>'nickname',''),
      nullif(p_profile->>'birthDate','')::date,
      nullif(p_profile->>'heightCm','')::numeric,
      nullif(p_profile->>'weightKg','')::numeric,
      nullif(p_profile->>'usualSize',''),
      now()
    )
    on conflict (user_id) do update set
      nickname=excluded.nickname,
      birth_date=excluded.birth_date,
      height_cm=excluded.height_cm,
      weight_kg=excluded.weight_kg,
      usual_size=excluded.usual_size,
      updated_at=now();
  end if;

  for item in select value from jsonb_array_elements(coalesce(p_price_alerts,'[]'::jsonb))
  loop
    if coalesce((item->>'targetPrice')::integer,0)<=0 then
      raise exception 'target price must be positive';
    end if;
    insert into public.price_alerts(user_id,product_id,target_price,enabled)
    values(uid,(item->>'productId')::uuid,(item->>'targetPrice')::integer,coalesce((item->>'enabled')::boolean,true))
    on conflict (user_id,product_id) do update set
      target_price=excluded.target_price,
      enabled=excluded.enabled;
  end loop;

  return public.get_my_app_data();
end $$;

revoke all on function public.sync_my_app_data(uuid[],jsonb,jsonb) from public;
grant execute on function public.sync_my_app_data(uuid[],jsonb,jsonb) to authenticated;

comment on function public.sync_my_app_data(uuid[],jsonb,jsonb) is
'Additive explicit local-to-account synchronization boundary. Does not silently delete server-owned rows.';
