const fs=require('fs');
const latest=fs.readFileSync('supabase/migrations/025_account_deletion_hardening.sql','utf8');
const customerOwned=['push_devices','price_alerts','favorites','child_profiles'];
for(const table of customerOwned){if(!latest.includes(`delete from public.${table} where user_id=uid`))throw new Error(`delete_my_account missing customer-owned table: ${table}`)}
if(!latest.includes('delete from public.profiles where id=uid'))throw new Error('delete_my_account missing profiles');
if(!latest.includes('delete from auth.users where id=uid'))throw new Error('delete_my_account missing auth identity');
if(/grant execute on function public\.delete_my_account\(\) to (?:public|anon)/i.test(latest))throw new Error('delete RPC exposed to public/anon');
const inventory=fs.readFileSync('docs/account-data-inventory.md','utf8');
for(const table of customerOwned.concat(['profiles'])){if(!inventory.includes('`'+table+'`'))throw new Error('account data inventory missing '+table)}
console.log('account deletion contract PASS:',customerOwned.join(', '));
