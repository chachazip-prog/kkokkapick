-- KKOKKAPICK MVP PostgreSQL / Supabase schema
create extension if not exists pgcrypto;

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  storage_policy text not null check (storage_policy in ('persistent','ttl_cache','realtime_only')),
  cache_ttl_minutes integer,
  enabled boolean not null default true,
  last_synced_at timestamptz
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  canonical_key text unique,
  brand text,
  name text not null,
  category text not null,
  stage text,
  fit_status text not null default 'unverified' check (fit_status in ('unverified','candidate','verified')),
  image_url text,
  min_months integer,
  max_months integer,
  status text not null default 'active',
  search_text tsvector generated always as (to_tsvector('simple', coalesce(brand,'') || ' ' || name || ' ' || category)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_search_idx on products using gin(search_text);
create index if not exists products_category_status_idx on products(category,status);

create table if not exists product_sizes (
  product_id uuid references products(id) on delete cascade,
  size_label text not null,
  primary key(product_id,size_label)
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  provider_id uuid not null references providers(id),
  merchant text not null,
  external_product_id text not null,
  price integer not null check(price>=0),
  shipping_fee integer not null default 0 check(shipping_fee>=0),
  affiliate_url text,
  in_stock boolean not null default true,
  checked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_id,external_product_id)
);
create index if not exists offers_product_stock_idx on offers(product_id,in_stock,price);

create table if not exists price_history (
  offer_id uuid references offers(id) on delete cascade,
  captured_at timestamptz not null default now(),
  price integer not null,
  shipping_fee integer not null default 0,
  primary key(offer_id,captured_at)
);

create table if not exists child_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text,
  birth_date date,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  usual_size text,
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,product_id)
);

create table if not exists price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  target_price integer,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table child_profiles enable row level security;
alter table favorites enable row level security;
alter table price_alerts enable row level security;
create policy "own child profiles" on child_profiles for all using (auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own favorites" on favorites for all using (auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own price alerts" on price_alerts for all using (auth.uid()=user_id) with check(auth.uid()=user_id);
