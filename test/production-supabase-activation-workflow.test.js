const fs = require('fs');
const s = fs.readFileSync('.github/workflows/production-supabase-activation.yml','utf8');
for (const term of [
  'workflow_dispatch:',
  'confirm_read_only_verification',
  'environment: production',
  'PRODUCTION_DATABASE_URL',
  'PRODUCTION_SUPABASE_URL',
  'PRODUCTION_SUPABASE_ANON_KEY',
  'PRODUCTION_TEST_EMAIL',
  'PRODUCTION_TEST_PASSWORD',
  'production-migration-manifest.js',
  'production-verification.sql',
  'validate-production-verification.js',
  'production-email-auth-smoke.js',
  'production-supabase-schema-evidence',
  'production-email-auth-smoke',
]) if (!s.includes(term)) throw new Error('production activation workflow missing: '+term);
if (/delete_my_account|delete from auth\.users/i.test(s)) throw new Error('activation workflow must remain non-destructive');
if (/echo\s+["']?\$\{?PRODUCTION_/i.test(s)) throw new Error('production secret must not be echoed');
console.log('production Supabase activation workflow contract PASS');
