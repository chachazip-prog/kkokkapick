const fs=require('fs');
const main=fs.readFileSync('flutter/lib/main.dart','utf8');
if(!main.includes("String.fromEnvironment('SUPABASE_URL')"))throw new Error('SUPABASE_URL compile-time boundary missing');
if(!main.includes("String.fromEnvironment('SUPABASE_ANON_KEY')"))throw new Error('SUPABASE_ANON_KEY compile-time boundary missing');
const guard=fs.readFileSync('scripts/guard-production-config.sh','utf8');
for(const term of ['APP_ENV','production','SUPABASE_URL','SUPABASE_ANON_KEY','github.io','HTTPS'])if(!guard.includes(term))throw new Error('production config guard missing '+term);
console.log('production config contract PASS');
