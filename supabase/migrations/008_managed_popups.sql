-- 008: operator-managed notices/popups.
create table if not exists public.managed_popups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  image_url text,
  destination_url text,
  surface text not null default 'all' check (surface in ('all','web','app')),
  placement text not null default 'home',
  dismiss_policy text not null default 'session' check (dismiss_policy in ('session','daily','forever','none')),
  status text not null default 'draft' check (status in ('draft','scheduled','published','paused','ended')),
  starts_at timestamptz,
  ends_at timestamptz,
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index if not exists managed_popups_schedule_idx on public.managed_popups(status,starts_at,ends_at,priority desc);
alter table public.managed_popups enable row level security;

create or replace view public.published_popups as
select id,title,body,image_url,destination_url,surface,placement,dismiss_policy,starts_at,ends_at,priority
from public.managed_popups
where status='published'
  and (starts_at is null or starts_at<=now())
  and (ends_at is null or ends_at>now());

create policy "admins read popups" on public.managed_popups for select using (public.is_kkokkapick_admin());
create policy "admins write popups" on public.managed_popups for all using (public.is_kkokkapick_admin()) with check (public.is_kkokkapick_admin());

comment on view public.published_popups is 'Public-safe currently published popup read model.';
