-- 006: public commercial read model + attribution events.
-- Apply after 005_commercial_admin.sql.

create table if not exists public.commercial_events (
  id bigint generated always as identity primary key,
  campaign_id uuid references public.commercial_campaigns(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  event_type text not null check (event_type in ('impression','click','conversion')),
  session_key text,
  revenue numeric(14,2),
  occurred_at timestamptz not null default now()
);
create index if not exists commercial_events_campaign_time_idx on public.commercial_events(campaign_id,occurred_at desc);
alter table public.commercial_events enable row level security;

create or replace view public.published_commercial_campaigns as
select c.id,c.title,c.campaign_type,c.disclosure_label,c.starts_at,c.ends_at,c.destination_url,c.image_url,c.placement,c.priority,
       p.name as partner_name,p.partner_type
from public.commercial_campaigns c
join public.commercial_partners p on p.id=c.partner_id
where c.status='published'
  and p.status='active'
  and (c.starts_at is null or c.starts_at<=now())
  and (c.ends_at is null or c.ends_at>now());

create or replace view public.commercial_campaign_performance as
select c.id as campaign_id,c.title,
  count(e.id) filter(where e.event_type='impression') as impressions,
  count(e.id) filter(where e.event_type='click') as clicks,
  count(e.id) filter(where e.event_type='conversion') as conversions,
  coalesce(sum(e.revenue) filter(where e.event_type='conversion'),0) as attributed_revenue
from public.commercial_campaigns c
left join public.commercial_events e on e.campaign_id=c.id
group by c.id,c.title;

comment on view public.published_commercial_campaigns is 'Public-safe active campaign read model; admin-only fields are excluded.';
comment on table public.commercial_events is 'Commercial attribution events. Do not store child profile or direct personal identifiers here.';
