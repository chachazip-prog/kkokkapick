-- 004: prepare server-side product state for mobile clients.
-- Provider retention rules still govern whether source data may be persisted.

create index if not exists products_brand_idx on products (brand);
create index if not exists products_category_idx on products (category);
create index if not exists products_stage_idx on products (stage);
create index if not exists offers_product_price_idx on offers (product_id, price);
create index if not exists price_history_product_observed_idx on price_history (product_id, observed_at desc);
create index if not exists price_alerts_user_product_idx on price_alerts (user_id, product_id);

create or replace view public.product_price_summary as
select
  p.id as product_id,
  min(o.price) filter (where o.price > 0) as min_price,
  count(o.id) as offer_count,
  max(o.updated_at) as offers_updated_at
from products p
left join offers o on o.product_id = p.id
group by p.id;

comment on view public.product_price_summary is
'Derived product price summary for app reads. Provider retention policy remains authoritative.';
