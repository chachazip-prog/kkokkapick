-- 013: lock core catalog/source tables behind RLS before production API exposure.
-- Provider ingestion is expected to use the trusted service role, which bypasses RLS.

alter table public.providers enable row level security;
alter table public.products enable row level security;
alter table public.product_sizes enable row level security;
alter table public.offers enable row level security;
alter table public.price_history enable row level security;

-- Browser admin may inspect catalog data, but anonymous/authenticated clients do
-- not receive direct table access. Production clients should use a deliberately
-- narrow catalog read model/RPC so provider-policy fields cannot leak.
create policy "admins read providers" on public.providers for select using (public.is_kkokkapick_admin());
create policy "admins read products" on public.products for select using (public.is_kkokkapick_admin());
create policy "admins read product sizes" on public.product_sizes for select using (public.is_kkokkapick_admin());
create policy "admins read offers" on public.offers for select using (public.is_kkokkapick_admin());
create policy "admins read price history" on public.price_history for select using (public.is_kkokkapick_admin());

comment on table public.products is 'Core catalog table. Do not expose directly to public clients; use an approved read model.';
comment on table public.offers is 'Provider offer table. Service-role ingestion and admin inspection only until a public-safe read model is defined.';
