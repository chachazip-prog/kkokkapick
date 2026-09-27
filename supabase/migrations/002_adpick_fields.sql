-- ADPICK recommended-product fields
alter table offers add column if not exists original_price integer check(original_price is null or original_price >= 0);
alter table offers add column if not exists commission_text text;
alter table offers add column if not exists commission_rate numeric(7,3);
alter table offers add column if not exists merchant_domain text;
alter table offers add column if not exists price_status text not null default 'known'
  check(price_status in ('known','check_at_merchant'));

create table if not exists provider_themes (
  provider_id uuid not null references providers(id) on delete cascade,
  theme_code text not null,
  title text,
  description text,
  last_seen_at timestamptz not null default now(),
  primary key(provider_id, theme_code)
);
