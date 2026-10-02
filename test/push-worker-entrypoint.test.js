import fs from 'node:fs';

const s=fs.readFileSync('scripts/run-price-alert-push-worker.js','utf8');
for(const term of [
  "PUSH_WORKER_EXECUTE !== '1'",
  'PRODUCTION_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'FCM_SERVICE_ACCOUNT_JSON',
  'APNS_PRIVATE_KEY_P8',
  'PUSH_WORKER_PLATFORM',
]) if(!s.includes(term)) throw new Error('worker entrypoint missing: '+term);
if(/console\.(log|error)\([^\n]*(token|private|service_role|credential)/i.test(s)){
  throw new Error('worker entrypoint may log sensitive material');
}
console.log('push worker entrypoint guard PASS');
