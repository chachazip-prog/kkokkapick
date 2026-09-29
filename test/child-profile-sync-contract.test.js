const fs=require('fs');
const sql=fs.readFileSync('supabase/migrations/029_child_profile_age_months_sync.sql','utf8');
for(const term of [
  'add column if not exists age_months integer',
  "nullif(p_profile->>'months','')::integer",
  'create or replace function public.sync_my_app_data',
  'create or replace function public.set_my_child_profile',
  'auth.uid()',
  'grant execute on function public.sync_my_app_data(uuid[],jsonb,jsonb) to authenticated',
  'grant execute on function public.set_my_child_profile(jsonb) to authenticated',
  'revoke all on function public.set_my_child_profile(jsonb) from public,anon'
]) if(!sql.includes(term)) throw new Error('child profile sync contract missing '+term);
if(/grant execute on function public\.set_my_child_profile\(jsonb\) to anon/.test(sql)) throw new Error('anonymous child-profile mutation must stay forbidden');
console.log('child profile sync contract PASS');
