alter table providers
  add column if not exists cache_ttl_hours integer,
  add column if not exists policy_verified_at timestamptz,
  add column if not exists policy_reference text;

alter table products
  add column if not exists source_expires_at timestamptz;

create index if not exists products_source_expires_at_idx
  on products(source_expires_at)
  where source_expires_at is not null;

-- ADPICK BIZ remains TTL-cache only until persistence/redisplay rights are verified.
insert into providers (code, name, storage_policy, cache_ttl_hours)
values ('adpick_biz', 'ADPICK BIZ', 'ttl_cache', 24)
on conflict (code) do update
set storage_policy = 'ttl_cache',
    cache_ttl_hours = 24;

create or replace function purge_expired_provider_products()
returns bigint
language plpgsql
security definer
as $$
declare deleted_count bigint;
begin
  delete from products
  where source_expires_at is not null
    and source_expires_at <= now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
