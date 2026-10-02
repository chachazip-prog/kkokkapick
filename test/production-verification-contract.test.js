const fs=require('fs');
const sql=fs.readFileSync('supabase/production-verification.sql','utf8');
if(!/begin read only/i.test(sql)||!/rollback;/i.test(sql))throw new Error('production verification must remain read-only');
if(!sql.includes('jsonb_build_object'))throw new Error('production verification must emit machine-readable JSON');

for(const rpc of [
  'get_published_catalog','get_my_app_data','sync_my_app_data','set_my_favorite',
  'set_my_price_alert','set_my_child_profile','delete_my_app_data','delete_my_account',
  'set_my_push_device','remove_my_push_device','record_commercial_event',
  'evaluate_price_alerts','claim_price_alert_deliveries','complete_price_alert_delivery'
]) if(!sql.includes(rpc)) throw new Error('verification missing RPC: '+rpc);

for(const table of [
  'profiles','child_profiles','favorites','price_alerts','push_devices','price_alert_deliveries',
  'providers','provider_themes','products','product_sizes','offers','price_history','brand_size_guides',
  'commercial_partners','commercial_campaigns','commercial_campaign_products','commercial_events',
  'admin_users','managed_popups','catalog_overrides','brand_size_evidence','admin_audit_log'
]) if(!sql.includes("('"+table+"')")) throw new Error('verification missing RLS table: '+table);

for(const view of [
  'published_catalog_products','published_catalog_offers','product_price_summary',
  'commercial_campaign_performance','published_commercial_campaigns','published_popups'
]) if(!sql.includes(view)) throw new Error('verification missing view boundary: '+view);

if(/delete\s+from|insert\s+into|update\s+public\./i.test(sql))throw new Error('destructive SQL not allowed in production verification');
console.log('production verification contract PASS');
