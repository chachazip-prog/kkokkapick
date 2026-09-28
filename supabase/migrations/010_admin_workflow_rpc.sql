-- 010: commercial scheduling RPCs and audit helpers.

create or replace function public.admin_set_campaign_status(p_id uuid,p_status text)
returns void language plpgsql security definer set search_path=public as $$
declare old_row jsonb; new_row jsonb;
begin
  if not public.is_kkokkapick_admin() then raise exception 'forbidden'; end if;
  if p_status not in ('draft','scheduled','published','paused','ended') then raise exception 'invalid status'; end if;
  select to_jsonb(c) into old_row from commercial_campaigns c where id=p_id;
  update commercial_campaigns set status=p_status,updated_at=now() where id=p_id;
  select to_jsonb(c) into new_row from commercial_campaigns c where id=p_id;
  insert into admin_audit_log(actor_user_id,action,entity_type,entity_id,before_state,after_state)
  values(auth.uid(),'status_change','commercial_campaign',p_id::text,old_row,new_row);
end $$;

create or replace function public.admin_set_popup_status(p_id uuid,p_status text)
returns void language plpgsql security definer set search_path=public as $$
declare old_row jsonb; new_row jsonb;
begin
  if not public.is_kkokkapick_admin() then raise exception 'forbidden'; end if;
  if p_status not in ('draft','scheduled','published','paused','ended') then raise exception 'invalid status'; end if;
  select to_jsonb(p) into old_row from managed_popups p where id=p_id;
  update managed_popups set status=p_status,updated_at=now() where id=p_id;
  select to_jsonb(p) into new_row from managed_popups p where id=p_id;
  insert into admin_audit_log(actor_user_id,action,entity_type,entity_id,before_state,after_state)
  values(auth.uid(),'status_change','managed_popup',p_id::text,old_row,new_row);
end $$;

create or replace function public.admin_duplicate_campaign(p_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare new_id uuid;
begin
 if not public.is_kkokkapick_admin() then raise exception 'forbidden'; end if;
 insert into commercial_campaigns(partner_id,title,campaign_type,status,disclosure_label,destination_url,image_url,placement,priority)
 select partner_id,title||' 복사본',campaign_type,'draft',disclosure_label,destination_url,image_url,placement,priority
 from commercial_campaigns where id=p_id returning id into new_id;
 insert into commercial_campaign_products(campaign_id,product_id,sort_order)
 select new_id,product_id,sort_order from commercial_campaign_products where campaign_id=p_id;
 insert into admin_audit_log(actor_user_id,action,entity_type,entity_id,after_state)
 values(auth.uid(),'duplicate','commercial_campaign',new_id::text,jsonb_build_object('source_id',p_id));
 return new_id;
end $$;
