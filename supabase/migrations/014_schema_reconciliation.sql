-- 014: reconcile schema drift before first production Supabase deployment.
-- Earlier prototype read models referenced fields not present in 001.

alter table public.products
  add column if not exists stage text,
  add column if not exists fit_status text not null default 'unverified'
    check (fit_status in ('unverified','candidate','verified'));

alter table public.offers
  add column if not exists updated_at timestamptz not null default now();

-- 004 was authored against an older price-history shape. Keep history offer-based
-- and derive product through offers instead of duplicating product_id.
drop index if exists public.price_history_product_observed_idx;
create index if not exists price_history_offer_captured_idx
  on public.price_history(offer_id,captured_at desc);

create or replace view public.product_price_summary as
select
  p.id as product_id,
  min(o.price) filter (where o.price > 0 and o.in_stock) as min_price,
  max(o.price) filter (where o.price > 0 and o.in_stock) as max_price,
  count(o.id) filter (where o.in_stock) as offer_count,
  max(o.updated_at) as offers_updated_at
from public.products p
left join public.offers o on o.product_id=p.id
where p.status='active'
  and (p.source_expires_at is null or p.source_expires_at>now())
group by p.id;

comment on view public.product_price_summary is
'Fresh active product price summary. Provider retention policy remains authoritative.';
