-- 009: operator overrides, size evidence and audit log.

create table if not exists public.catalog_overrides (
  product_id uuid primary key references public.products(id) on delete cascade,
  hidden boolean not null default false,
  brand_override text,
  category_override text,
  stage_override text,
  note text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_size_evidence (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  status text not null default 'candidate' check (status in ('candidate','verified','rejected')),
  source_url text,
  source_label text,
  evidence_note text,
  verified_at timestamptz,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_state jsonb,
  after_state jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists admin_audit_log_entity_idx on public.admin_audit_log(entity_type,entity_id,occurred_at desc);
create index if not exists brand_size_evidence_brand_idx on public.brand_size_evidence(brand,status);

alter table public.catalog_overrides enable row level security;
alter table public.brand_size_evidence enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "admins manage catalog overrides" on public.catalog_overrides for all using (public.is_kkokkapick_admin()) with check (public.is_kkokkapick_admin());
create policy "admins manage size evidence" on public.brand_size_evidence for all using (public.is_kkokkapick_admin()) with check (public.is_kkokkapick_admin());
create policy "admins read audit log" on public.admin_audit_log for select using (public.is_kkokkapick_admin());
create policy "admins append audit log" on public.admin_audit_log for insert with check (public.is_kkokkapick_admin());

comment on table public.catalog_overrides is 'Exceptional operator corrections; ingestion remains the default source of truth.';
comment on table public.brand_size_evidence is 'Evidence registry. Commercial partner status never implies verified fit evidence.';
