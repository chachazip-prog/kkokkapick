-- 027: serialize public commercial-event checks per opaque session.
-- Prevents concurrent requests using the same session key from racing past the
-- minute cap or rapid-replay check. Rotating caller-controlled session keys can
-- still bypass this coarse DB boundary; production edge controls remain required.

create or replace function public.record_commercial_event(
  p_campaign_id uuid,
  p_event_type text,
  p_product_id uuid default null,
  p_session_key text default null
) returns void
language plpgsql security definer set search_path=public as $$
declare
  v_session text:=left(nullif(trim(p_session_key),''),128);
begin
  if p_event_type not in ('impression','click') then raise exception 'unsupported public event'; end if;
  if v_session is null or length(v_session)<16 then raise exception 'opaque session key required'; end if;

  perform pg_advisory_xact_lock(hashtext(v_session)::bigint);

  if not exists (select 1 from published_commercial_campaigns c where c.id=p_campaign_id) then
    raise exception 'campaign is not currently published';
  end if;

  if (select count(*) from commercial_events
      where session_key=v_session
        and event_type in ('impression','click')
        and created_at>=now()-interval '1 minute')>=60 then
    raise exception 'rate limit exceeded';
  end if;

  if exists (
    select 1 from commercial_events
    where campaign_id=p_campaign_id
      and event_type=p_event_type
      and product_id is not distinct from p_product_id
      and session_key=v_session
      and created_at>=now()-interval '10 seconds'
  ) then return; end if;

  insert into commercial_events(campaign_id,product_id,event_type,session_key,revenue)
  values(p_campaign_id,p_product_id,p_event_type,v_session,null);
end $$;

revoke all on function public.record_commercial_event(uuid,text,uuid,text) from public;
grant execute on function public.record_commercial_event(uuid,text,uuid,text) to anon,authenticated;
