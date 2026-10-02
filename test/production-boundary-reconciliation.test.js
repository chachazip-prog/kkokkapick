const fs=require('fs');
const m=fs.readFileSync('supabase/migrations/030_production_boundary_reconciliation.sql','utf8');
for(const term of [
  'create table if not exists public.profiles',
  'alter table public.profiles enable row level security',
  'create policy "own profile"',
  'alter table public.provider_themes enable row level security',
  'revoke all on public.provider_themes from public,anon,authenticated',
  'revoke all on public.product_price_summary from public,anon,authenticated',
  'revoke all on public.commercial_campaign_performance from public,anon,authenticated',
]) if(!m.includes(term)) throw new Error('030 boundary reconciliation missing: '+term);

const deletion=fs.readFileSync('supabase/migrations/025_account_deletion_hardening.sql','utf8');
if(!deletion.includes('delete from public.profiles where id=uid'))throw new Error('profiles must remain in account deletion coverage');
console.log('production boundary reconciliation PASS');
