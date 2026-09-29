const fs=require('fs');
const sql=fs.readFileSync('supabase/production-verification.sql','utf8');
if(!/begin read only/i.test(sql)||!/rollback;/i.test(sql))throw new Error('production verification must remain read-only');
for(const rpc of ['get_published_catalog','get_my_app_data','sync_my_app_data','delete_my_account','record_commercial_event'])if(!sql.includes(rpc))throw new Error('verification missing RPC: '+rpc);
for(const table of ['profiles','child_profiles','favorites','price_alerts','push_devices','commercial_events'])if(!sql.includes("'"+table+"'"))throw new Error('verification missing RLS table: '+table);
if(/delete\s+from|insert\s+into|update\s+public\./i.test(sql))throw new Error('destructive SQL not allowed in production verification');
console.log('production verification contract PASS');
