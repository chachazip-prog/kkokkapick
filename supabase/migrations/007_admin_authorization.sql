-- 007: admin authorization. Run only after migrations 005 and 006.
-- Add authorized Supabase auth user IDs to admin_users through a trusted SQL/admin channel.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_kkokkapick_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.admin_users a where a.user_id=auth.uid()) $$;

create policy "admins read partners" on public.commercial_partners for select using (public.is_kkokkapick_admin());
create policy "admins write partners" on public.commercial_partners for all using (public.is_kkokkapick_admin()) with check (public.is_kkokkapick_admin());
create policy "admins read campaigns" on public.commercial_campaigns for select using (public.is_kkokkapick_admin());
create policy "admins write campaigns" on public.commercial_campaigns for all using (public.is_kkokkapick_admin()) with check (public.is_kkokkapick_admin());
create policy "admins manage campaign products" on public.commercial_campaign_products for all using (public.is_kkokkapick_admin()) with check (public.is_kkokkapick_admin());
create policy "admins read commercial events" on public.commercial_events for select using (public.is_kkokkapick_admin());

-- No anonymous write policy is granted. Public campaign consumption should use
-- the restricted published view/API boundary rather than exposing admin tables.
