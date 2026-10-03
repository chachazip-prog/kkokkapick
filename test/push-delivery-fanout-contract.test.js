import fs from 'node:fs';

const sql=fs.readFileSync('supabase/migrations/031_push_delivery_target_fanout.sql','utf8').toLowerCase();
for(const term of [
  'create table if not exists public.price_alert_delivery_targets',
  'unique(delivery_id,device_id)',
  'for update skip locked',
  "p_platform text default null",
  "t.platform=p_platform",
  "set enabled=false",
  "pd.user_id=a.user_id",
  "push_device_disabled_or_reassigned",
  "last_error='all_push_targets_failed'",
  "and not exists (",
  "where t.delivery_id=d.id and t.status in ('pending','processing')",
  'grant execute on function public.claim_price_alert_delivery_targets(integer,interval,integer,text)',
  'to service_role',
  'grant execute on function public.complete_price_alert_delivery_target(uuid,boolean,boolean,boolean,text,integer)',
]){
  if(!sql.includes(term.toLowerCase()))throw new Error('push target fanout contract missing: '+term);
}
if(!sql.includes("status in ('pending','processing','sent','failed')"))throw new Error('target lifecycle constraint missing');
if(!sql.includes("when p_retryable and not p_invalid_token and attempts<p_max_attempts then 'pending'"))throw new Error('invalid tokens must never retry');
console.log('push target fanout DB contract PASS');

const fcm=fs.readFileSync('src/fcm-sender.js','utf8');
const apns=fs.readFileSync('src/apns-sender.js','utf8');
if(/productId|observedPrice/.test(fcm.split('data: {')[1]?.split('}')[0]||''))throw new Error('FCM transport must not expose product identity/price');
if(/productId|observedPrice/.test(apns.split('kkokkapick: {')[1]?.split('}')[0]||''))throw new Error('APNs transport must not expose product identity/price');
