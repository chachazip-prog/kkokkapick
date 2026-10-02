-- 030: reconcile production security boundaries before first external beta.
-- Earlier account lifecycle migrations reference public.profiles; create the
-- minimal account-owned row explicitly instead of relying on an implicit table.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid()=id) with check (auth.uid()=id);

-- provider_themes is provider-ingestion metadata and is not a public app surface.
alter table public.provider_themes enable row level security;
revoke all on public.provider_themes from public,anon,authenticated;

-- Legacy implementation/read-model helpers must not become accidental public APIs.
-- Mobile catalog reads use get_published_catalog(); commercial metrics stay admin-only.
revoke all on public.product_price_summary from public,anon,authenticated;
revoke all on public.commercial_campaign_performance from public,anon,authenticated;

comment on table public.profiles is
  'Minimal account-owned profile row; customer deletion is handled by delete_my_account().';
