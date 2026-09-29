-- 021: deterministic price-alert threshold evaluation.
-- Trusted scheduler/worker calls this RPC after offer refresh. It queues at most one
-- delivery per alert+observed price and never sends notifications itself.

create or replace function public.evaluate_price_alerts(p_limit integer default 500)
returns table(delivery_id uuid,alert_id uuid,user_id uuid,product_id uuid,observed_price integer)
language plpgsql
security definer
set search_path=public
as $$
begin
  if p_limit<1 or p_limit>2000 then raise exception 'limit out of range'; end if;

  return query
  with current_prices as (
    select o.product_id,min(o.price+coalesce(o.shipping_fee,0))::integer as observed_price
    from public.offers o
    join public.products p on p.id=o.product_id
    where o.in_stock and p.status='active'
      and (p.source_expires_at is null or p.source_expires_at>now())
    group by o.product_id
  ), eligible as (
    select a.id alert_id,a.user_id,a.product_id,c.observed_price
    from public.price_alerts a
    join current_prices c on c.product_id=a.product_id
    where a.enabled and a.target_price is not null and c.observed_price<=a.target_price
    order by a.created_at,a.id
    limit p_limit
  ), inserted as (
    insert into public.price_alert_deliveries(alert_id,observed_price,status)
    select e.alert_id,e.observed_price,'pending' from eligible e
    on conflict(alert_id,observed_price) do nothing
    returning id,alert_id,observed_price
  )
  select i.id,i.alert_id,e.user_id,e.product_id,i.observed_price
  from inserted i join eligible e on e.alert_id=i.alert_id;
end $$;

-- This is an internal worker boundary. Never expose it to app roles.
revoke all on function public.evaluate_price_alerts(integer) from public,anon,authenticated;

comment on function public.evaluate_price_alerts(integer) is
  'Trusted-worker threshold evaluator; queues idempotent pending deliveries and returns only newly queued work.';
