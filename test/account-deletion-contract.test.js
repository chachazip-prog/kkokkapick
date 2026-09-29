const fs=require('fs');
const path=require('path');
const dir=path.join(__dirname,'..','supabase','migrations');
const files=fs.readdirSync(dir).filter(x=>x.endsWith('.sql')).sort();
const sql=files.map(x=>fs.readFileSync(path.join(dir,x),'utf8')).join('\n');
const latest=fs.readFileSync(path.join(dir,'025_account_deletion_hardening.sql'),'utf8');
const userOwned=[...sql.matchAll(/create table if not exists public\.(\w+)\s*\([\s\S]*?user_id uuid[^;]*?references auth\.users\(id\)/gi)].map(m=>m[1]);
const expected=new Set(['push_devices','price_alerts','favorites','child_profiles']);
for(const table of expected){if(!latest.includes(`delete from public.${table} where user_id=uid`))throw new Error(`delete_my_account missing ${table}`)}
if(!latest.includes('delete from public.profiles where id=uid'))throw new Error('delete_my_account missing profiles');
if(!latest.includes('delete from auth.users where id=uid'))throw new Error('delete_my_account missing auth identity');
for(const table of userOwned){if(!expected.has(table)&&!latest.includes(`delete from public.${table} where user_id=uid`))throw new Error(`new auth-owned table requires deletion review: ${table}`)}
if(/grant execute on function public\.delete_my_account\(\) to (?:public|anon)/i.test(latest))throw new Error('delete RPC exposed to public/anon');
console.log('account deletion contract PASS:',[...expected].join(', '));
