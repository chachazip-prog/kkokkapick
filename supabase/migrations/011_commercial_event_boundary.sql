-- 011: privacy-safe public commercial event ingestion and dashboard read model.

create or replace function public.record_commercial_event(
  p_campaign_id uuid,
  p_event_type text,
  p_product_id uuid default null,
  p_session_key text default null
) returns void
language plpgsql security definer set search_path=public as $$
begin
  if p_event_type not in ('impression','click') then raise exception 'unsupported public event'; end if;
  if not exists (
    select 1 from published_commercial_campaigns c where c.id=p_campaign_id
  ) then raise exception 'campaign is not currently published'; end if;
  insert into commercial_events(campaign_id,product_id,event_type,session_key,revenue)
  values(p_campaign_id,p_product_id,p_event_type,left(nullif(p_session_key,''),128),null);
end $$;

revoke all on function public.record_commercial_event(uuid,text,uuid,text) from public;
grant execute on function public.record_commercial_event(uuid,text,uuid,text) to anon, authenticated;

create or replace view public.admin_commercial_dashboard as
select
  c.id campaign_id,
  c.title,
  c.status,
  c.placement,
  p.name partner_name,
  count(e.id) filter (where e.event_type='impression') impressions,
  count(e.id) filter (where e.event_type='click') clicks,
  count(e.id) filter (where e.event_type='conversion') conversions,
  coalesce(sum(e.revenue) filter (where e.event_type='conversion'),0) attributed_revenue
from commercial_campaigns c
join commercial_partners p on p.id=c.partner_id
left join commercial_events e on e.campaign_id=c.id
group by c.id,c.title,c.status,c.placement,p.name;

comment on function public.record_commercial_event(uuid,text,uuid,text) is 'Public client event boundary. Conversion and revenue remain server/provider-side only.';
