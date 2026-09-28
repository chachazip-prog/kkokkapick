-- 005: operator-managed monetization surfaces.
-- Admin UI should write through authenticated server-side access; public clients only read published records.

create table if not exists public.commercial_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  partner_type text not null check (partner_type in ('sponsor','premium_brand','commerce_affiliate')),
  status text not null default 'draft' check (status in ('draft','active','paused','ended')),
  contact_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commercial_campaigns (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.commercial_partners(id) on delete cascade,
  title text not null,
  campaign_type text not null check (campaign_type in ('sponsored_slot','curation','premium_brand','commerce_affiliate')),
  status text not null default 'draft' check (status in ('draft','scheduled','published','paused','ended')),
  disclosure_label text not null default 'Sponsored',
  starts_at timestamptz,
  ends_at timestamptz,
  destination_url text,
  image_url text,
  placement text,
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.commercial_campaign_products (
  campaign_id uuid references public.commercial_campaigns(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (campaign_id,product_id)
);

create index if not exists commercial_campaign_schedule_idx on public.commercial_campaigns(status,starts_at,ends_at);
create index if not exists commercial_campaign_partner_idx on public.commercial_campaigns(partner_id);

alter table public.commercial_partners enable row level security;
alter table public.commercial_campaigns enable row level security;
alter table public.commercial_campaign_products enable row level security;

comment on table public.commercial_campaigns is 'Operator-managed monetization placements. Sponsored content must retain explicit disclosure.';
