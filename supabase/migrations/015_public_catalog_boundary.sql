-- 015: public-safe production catalog read boundary.
-- Only active, non-expired products and in-stock offers are exposed.
-- Internal provider policy fields, commission data and external provider IDs stay private.

create or replace view public.published_catalog_products
as
select
  p.id,
  p.brand,
  p.name,
  p.category,
  p.stage,
  p.fit_status,
  p.image_url,
  p.min_months,
  p.max_months,
  s.min_price,
  s.max_price,
  s.offer_count,
  s.offers_updated_at
from public.products p
left join public.product_price_summary s on s.product_id=p.id
where p.status='active'
  and (p.source_expires_at is null or p.source_expires_at>now());

create or replace view public.published_catalog_offers
as
select
  o.id,
  o.product_id,
  o.merchant,
  o.price,
  o.original_price,
  o.shipping_fee,
  o.affiliate_url,
  o.price_status,
  o.checked_at,
  o.updated_at
from public.offers o
join public.products p on p.id=o.product_id
where o.in_stock
  and p.status='active'
  and (p.source_expires_at is null or p.source_expires_at>now());

-- RLS on the base tables deliberately blocks direct anonymous/authenticated reads.
-- A security-definer RPC is the explicit public boundary and returns only the
-- columns above. Keep this function free of child/user profile data.
create or replace function public.get_published_catalog(
  p_limit integer default 200,
  p_offset integer default 0
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare result jsonb;
begin
  if p_limit<1 or p_limit>500 then raise exception 'limit out of range'; end if;
  if p_offset<0 then raise exception 'offset out of range'; end if;

  select jsonb_build_object(
    'products',coalesce(jsonb_agg(
      jsonb_build_object(
        'id',q.id,'name',q.name,'brand',q.brand,'category',q.category,'stage',q.stage,
        'fitStatus',q.fit_status,'imageUrl',q.image_url,'minMonths',q.min_months,'maxMonths',q.max_months,
        'minPrice',q.min_price,'maxPrice',q.max_price,'offerCount',q.offer_count,
        'offers',q.offers
      ) order by q.name
    ),'[]'::jsonb)
  ) into result
  from (
    select p.*,
      coalesce((
        select jsonb_agg(jsonb_build_object(
          'merchant',o.merchant,'price',o.price,'originalPrice',o.original_price,
          'shippingFee',o.shipping_fee,'affiliateUrl',o.affiliate_url,'priceStatus',o.price_status
        ) order by o.price)
        from public.published_catalog_offers o where o.product_id=p.id
      ),'[]'::jsonb) offers
    from public.published_catalog_products p
    order by p.name
    limit p_limit offset p_offset
  ) q;
  return coalesce(result,jsonb_build_object('products','[]'::jsonb));
end $$;

revoke all on function public.get_published_catalog(integer,integer) from public;
grant execute on function public.get_published_catalog(integer,integer) to anon,authenticated;

comment on function public.get_published_catalog(integer,integer) is
'Public-safe catalog boundary. Excludes provider policy, commission, external IDs and user/child data.';
