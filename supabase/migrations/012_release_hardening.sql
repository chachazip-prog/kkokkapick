-- 012: release hardening for scheduled commercial content and admin-only metrics.

-- Scheduled records become visible by server time without a cron/status mutation.
create or replace view public.published_commercial_campaigns as
select c.id,c.title,c.campaign_type,c.disclosure_label,c.starts_at,c.ends_at,c.destination_url,c.image_url,c.placement,c.priority,
       p.name as partner_name,p.partner_type
from public.commercial_campaigns c
join public.commercial_partners p on p.id=c.partner_id
where c.status in ('published','scheduled')
  and p.status='active'
  and (c.status<>'scheduled' or c.starts_at is not null)
  and (c.starts_at is null or c.starts_at<=now())
  and (c.ends_at is null or c.ends_at>now());

create or replace view public.published_popups as
select id,title,body,image_url,destination_url,surface,placement,dismiss_policy,starts_at,ends_at,priority
from public.managed_popups
where status in ('published','scheduled')
  and (status<>'scheduled' or starts_at is not null)
  and (starts_at is null or starts_at<=now())
  and (ends_at is null or ends_at>now());

-- Public clients may read only the deliberately narrow published views.
grant select on public.published_commercial_campaigns to anon,authenticated;
grant select on public.published_popups to anon,authenticated;

-- Never expose aggregate commercial performance as a directly selectable view.
revoke all on public.admin_commercial_dashboard from anon,authenticated;

create or replace function public.admin_get_commercial_dashboard()
returns setof public.admin_commercial_dashboard
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_kkokkapick_admin() then raise exception 'forbidden'; end if;
  return query select * from public.admin_commercial_dashboard order by impressions desc;
end $$;
revoke all on function public.admin_get_commercial_dashboard() from public;
grant execute on function public.admin_get_commercial_dashboard() to authenticated;

-- Publish/schedule validation belongs at the trusted status transition.
create or replace function public.admin_set_campaign_status(p_id uuid,p_status text)
returns void language plpgsql security definer set search_path=public as $$
declare old_row jsonb; new_row jsonb; r public.commercial_campaigns%rowtype;
begin
  if not public.is_kkokkapick_admin() then raise exception 'forbidden'; end if;
  if p_status not in ('draft','scheduled','published','paused','ended') then raise exception 'invalid status'; end if;
  select * into r from commercial_campaigns where id=p_id;
  if not found then raise exception 'campaign not found'; end if;
  if p_status in ('scheduled','published') then
    if r.partner_id is null then raise exception 'partner required'; end if;
    if nullif(trim(r.title),'') is null then raise exception 'title required'; end if;
    if nullif(trim(r.disclosure_label),'') is null then raise exception 'disclosure label required'; end if;
    if p_status='scheduled' and r.starts_at is null then raise exception 'scheduled start required'; end if;
    if r.starts_at is not null and r.ends_at is not null and r.ends_at<=r.starts_at then raise exception 'end must be after start'; end if;
  end if;
  old_row:=to_jsonb(r);
  update commercial_campaigns set status=p_status,updated_at=now() where id=p_id;
  select to_jsonb(c) into new_row from commercial_campaigns c where id=p_id;
  insert into admin_audit_log(actor_user_id,action,entity_type,entity_id,before_state,after_state)
  values(auth.uid(),'status_change','commercial_campaign',p_id::text,old_row,new_row);
end $$;

create or replace function public.admin_set_popup_status(p_id uuid,p_status text)
returns void language plpgsql security definer set search_path=public as $$
declare old_row jsonb; new_row jsonb; r public.managed_popups%rowtype;
begin
  if not public.is_kkokkapick_admin() then raise exception 'forbidden'; end if;
  if p_status not in ('draft','scheduled','published','paused','ended') then raise exception 'invalid status'; end if;
  select * into r from managed_popups where id=p_id;
  if not found then raise exception 'popup not found'; end if;
  if p_status in ('scheduled','published') then
    if nullif(trim(r.title),'') is null then raise exception 'title required'; end if;
    if p_status='scheduled' and r.starts_at is null then raise exception 'scheduled start required'; end if;
    if r.starts_at is not null and r.ends_at is not null and r.ends_at<=r.starts_at then raise exception 'end must be after start'; end if;
  end if;
  old_row:=to_jsonb(r);
  update managed_popups set status=p_status,updated_at=now() where id=p_id;
  select to_jsonb(p) into new_row from managed_popups p where id=p_id;
  insert into admin_audit_log(actor_user_id,action,entity_type,entity_id,before_state,after_state)
  values(auth.uid(),'status_change','managed_popup',p_id::text,old_row,new_row);
end $$;
