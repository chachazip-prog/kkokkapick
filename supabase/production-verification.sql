-- Machine-readable, read-only production verification.
-- Run with a privileged operator connection after all repository migrations.
-- Recommended: psql "$PRODUCTION_DATABASE_URL" -X -qAt -f supabase/production-verification.sql
begin read only;

select jsonb_build_object(
  'generatedAt', now(),
  'rls', (
    select coalesce(jsonb_object_agg(e.table_name,coalesce(c.relrowsecurity,false)),'{}'::jsonb)
    from (values
      ('profiles'),
      ('child_profiles'),
      ('favorites'),
      ('price_alerts'),
      ('push_devices'),
      ('price_alert_deliveries'),
      ('providers'),
      ('provider_themes'),
      ('products'),
      ('product_sizes'),
      ('offers'),
      ('price_history'),
      ('brand_size_guides'),
      ('commercial_partners'),
      ('commercial_campaigns'),
      ('commercial_campaign_products'),
      ('commercial_events'),
      ('admin_users'),
      ('managed_popups'),
      ('catalog_overrides'),
      ('brand_size_evidence'),
      ('admin_audit_log')
    ) e(table_name)
    left join pg_class c
      on c.relnamespace='public'::regnamespace and c.relname=e.table_name
  ),
  'routines', jsonb_build_object(
    'get_published_catalog', to_regprocedure('public.get_published_catalog(integer,integer)') is not null,
    'get_my_app_data', to_regprocedure('public.get_my_app_data()') is not null,
    'sync_my_app_data', to_regprocedure('public.sync_my_app_data(uuid[],jsonb,jsonb)') is not null,
    'set_my_favorite', to_regprocedure('public.set_my_favorite(uuid,boolean)') is not null,
    'set_my_price_alert', to_regprocedure('public.set_my_price_alert(uuid,integer)') is not null,
    'set_my_child_profile', to_regprocedure('public.set_my_child_profile(jsonb)') is not null,
    'delete_my_app_data', to_regprocedure('public.delete_my_app_data()') is not null,
    'delete_my_account', to_regprocedure('public.delete_my_account()') is not null,
    'set_my_push_device', to_regprocedure('public.set_my_push_device(text,text,boolean)') is not null,
    'remove_my_push_device', to_regprocedure('public.remove_my_push_device(text)') is not null,
    'record_commercial_event', to_regprocedure('public.record_commercial_event(uuid,text,uuid,text)') is not null,
    'evaluate_price_alerts', to_regprocedure('public.evaluate_price_alerts(integer)') is not null,
    'claim_price_alert_deliveries', to_regprocedure('public.claim_price_alert_deliveries(integer,interval,integer)') is not null,
    'complete_price_alert_delivery', to_regprocedure('public.complete_price_alert_delivery(uuid,boolean,boolean,text,integer)') is not null
  ),
  'grants', jsonb_build_object(
    'catalogAnonExecute', has_function_privilege('anon','public.get_published_catalog(integer,integer)','EXECUTE'),
    'catalogAuthenticatedExecute', has_function_privilege('authenticated','public.get_published_catalog(integer,integer)','EXECUTE'),
    'accountAnonExecute', has_function_privilege('anon','public.get_my_app_data()','EXECUTE'),
    'accountAuthenticatedExecute', has_function_privilege('authenticated','public.get_my_app_data()','EXECUTE'),
    'syncAnonExecute', has_function_privilege('anon','public.sync_my_app_data(uuid[],jsonb,jsonb)','EXECUTE'),
    'syncAuthenticatedExecute', has_function_privilege('authenticated','public.sync_my_app_data(uuid[],jsonb,jsonb)','EXECUTE'),
    'favoriteAnonExecute', has_function_privilege('anon','public.set_my_favorite(uuid,boolean)','EXECUTE'),
    'favoriteAuthenticatedExecute', has_function_privilege('authenticated','public.set_my_favorite(uuid,boolean)','EXECUTE'),
    'priceAlertAnonExecute', has_function_privilege('anon','public.set_my_price_alert(uuid,integer)','EXECUTE'),
    'priceAlertAuthenticatedExecute', has_function_privilege('authenticated','public.set_my_price_alert(uuid,integer)','EXECUTE'),
    'childProfileAnonExecute', has_function_privilege('anon','public.set_my_child_profile(jsonb)','EXECUTE'),
    'childProfileAuthenticatedExecute', has_function_privilege('authenticated','public.set_my_child_profile(jsonb)','EXECUTE'),
    'deleteAppDataAnonExecute', has_function_privilege('anon','public.delete_my_app_data()','EXECUTE'),
    'deleteAppDataAuthenticatedExecute', has_function_privilege('authenticated','public.delete_my_app_data()','EXECUTE'),
    'deleteAccountAnonExecute', has_function_privilege('anon','public.delete_my_account()','EXECUTE'),
    'deleteAccountAuthenticatedExecute', has_function_privilege('authenticated','public.delete_my_account()','EXECUTE'),
    'pushDeviceAnonExecute', has_function_privilege('anon','public.set_my_push_device(text,text,boolean)','EXECUTE'),
    'pushDeviceAuthenticatedExecute', has_function_privilege('authenticated','public.set_my_push_device(text,text,boolean)','EXECUTE'),
    'removePushAnonExecute', has_function_privilege('anon','public.remove_my_push_device(text)','EXECUTE'),
    'removePushAuthenticatedExecute', has_function_privilege('authenticated','public.remove_my_push_device(text)','EXECUTE'),
    'commercialAnonExecute', has_function_privilege('anon','public.record_commercial_event(uuid,text,uuid,text)','EXECUTE'),
    'commercialAuthenticatedExecute', has_function_privilege('authenticated','public.record_commercial_event(uuid,text,uuid,text)','EXECUTE'),
    'evaluateAnonExecute', has_function_privilege('anon','public.evaluate_price_alerts(integer)','EXECUTE'),
    'evaluateAuthenticatedExecute', has_function_privilege('authenticated','public.evaluate_price_alerts(integer)','EXECUTE'),
    'claimAnonExecute', has_function_privilege('anon','public.claim_price_alert_deliveries(integer,interval,integer)','EXECUTE'),
    'claimAuthenticatedExecute', has_function_privilege('authenticated','public.claim_price_alert_deliveries(integer,interval,integer)','EXECUTE'),
    'completeAnonExecute', has_function_privilege('anon','public.complete_price_alert_delivery(uuid,boolean,boolean,text,integer)','EXECUTE'),
    'completeAuthenticatedExecute', has_function_privilege('authenticated','public.complete_price_alert_delivery(uuid,boolean,boolean,text,integer)','EXECUTE')
  ),
  'views', jsonb_build_object(
    'publishedCatalogProductsAnonSelect', has_table_privilege('anon','public.published_catalog_products','SELECT'),
    'publishedCatalogOffersAnonSelect', has_table_privilege('anon','public.published_catalog_offers','SELECT'),
    'productPriceSummaryAnonSelect', has_table_privilege('anon','public.product_price_summary','SELECT'),
    'commercialPerformanceAnonSelect', has_table_privilege('anon','public.commercial_campaign_performance','SELECT'),
    'publishedCampaignsAnonSelect', has_table_privilege('anon','public.published_commercial_campaigns','SELECT'),
    'publishedPopupsAnonSelect', has_table_privilege('anon','public.published_popups','SELECT')
  )
)::text;

rollback;
