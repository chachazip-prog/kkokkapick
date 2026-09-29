-- 029: preserve privacy-minimized child age context across authenticated devices.
-- The mobile client currently asks for month age rather than exact date of birth.
-- Keep birth_date for backwards compatibility, but do not require or synthesize it.

alter table public.child_profiles
  add column if not exists age_months integer;

do $$ begin
  alter table public.child_profiles
    add constraint child_profiles_age_months_range
    check (age_months is null or age_months between 1 and 216);
exception when duplicate_object then null;
end $$;

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
    insert into public.child_profiles(
      user_id,nickname,birth_date,age_months,height_cm,weight_kg,usual_size,updated_at
    ) values (
      uid,
      nullif(p_profile->>'nickname',''),
      nullif(p_profile->>'birthDate','')::date,
      nullif(p_profile->>'months','')::integer,
      nullif(p_profile->>'heightCm','')::numeric,
      nullif(p_profile->>'weightKg','')::numeric,
      nullif(p_profile->>'usualSize',''),
      now()
    )
    on conflict (user_id) do update set
      nickname=coalesce(excluded.nickname,public.child_profiles.nickname),
      birth_date=coalesce(excluded.birth_date,public.child_profiles.birth_date),
      age_months=coalesce(excluded.age_months,public.child_profiles.age_months),
      height_cm=coalesce(excluded.height_cm,public.child_profiles.height_cm),
      weight_kg=coalesce(excluded.weight_kg,public.child_profiles.weight_kg),
      usual_size=coalesce(excluded.usual_size,public.child_profiles.usual_size),
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

create or replace function public.set_my_child_profile(p_profile jsonb)
returns void language plpgsql security invoker set search_path=public as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'authentication required'; end if;
  if p_profile is null then
    delete from public.child_profiles where user_id=uid;
    return;
  end if;

  insert into public.child_profiles(
    user_id,nickname,birth_date,age_months,height_cm,weight_kg,usual_size,updated_at
  ) values (
    uid,
    nullif(p_profile->>'nickname',''),
    nullif(p_profile->>'birthDate','')::date,
    nullif(p_profile->>'months','')::integer,
    nullif(p_profile->>'heightCm','')::numeric,
    nullif(p_profile->>'weightKg','')::numeric,
    nullif(p_profile->>'usualSize',''),
    now()
  )
  on conflict (user_id) do update set
    nickname=coalesce(excluded.nickname,public.child_profiles.nickname),
    birth_date=coalesce(excluded.birth_date,public.child_profiles.birth_date),
    age_months=coalesce(excluded.age_months,public.child_profiles.age_months),
    height_cm=coalesce(excluded.height_cm,public.child_profiles.height_cm),
    weight_kg=coalesce(excluded.weight_kg,public.child_profiles.weight_kg),
    usual_size=coalesce(excluded.usual_size,public.child_profiles.usual_size),
    updated_at=now();
end $$;

revoke all on function public.sync_my_app_data(uuid[],jsonb,jsonb) from public,anon;
revoke all on function public.set_my_child_profile(jsonb) from public,anon;
grant execute on function public.sync_my_app_data(uuid[],jsonb,jsonb) to authenticated;
grant execute on function public.set_my_child_profile(jsonb) to authenticated;

comment on column public.child_profiles.age_months is
  'Privacy-minimized month-age supplied by the user; exact birth date is not required.';
