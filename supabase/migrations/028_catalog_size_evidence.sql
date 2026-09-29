-- 028: expose size evidence through the same public-safe catalog RPC.
-- Provider/product option rows are factual catalog data; brand guides must only be
-- populated from a verified first-party source.

create table if not exists public.brand_size_guides (
  brand text primary key,
  source text not null,
  verified_at date not null,
  rows jsonb not null check (jsonb_typeof(rows)='array'),
  updated_at timestamptz not null default now()
);

alter table public.brand_size_guides enable row level security;
revoke all on public.brand_size_guides from public,anon,authenticated;
revoke all on public.product_sizes from public,anon,authenticated;

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
        'availableSizes',q.available_sizes,'sizeGuide',q.size_guide,'offers',q.offers
      ) order by q.name
    ),'[]'::jsonb)
  ) into result
  from (
    select p.*,
      coalesce((select jsonb_agg(ps.size_label order by ps.size_label) from public.product_sizes ps where ps.product_id=p.id),'[]'::jsonb) available_sizes,
      (select jsonb_build_object('kind','brand_official','source',b.source,'verifiedAt',b.verified_at,'rows',b.rows)
       from public.brand_size_guides b where b.brand=p.brand) size_guide,
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
