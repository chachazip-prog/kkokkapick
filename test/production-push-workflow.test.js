import fs from 'node:fs';

const smoke=fs.readFileSync('.github/workflows/production-push-verification.yml','utf8');
const worker=fs.readFileSync('.github/workflows/price-alert-push-worker.yml','utf8');
for(const term of [
  'workflow_dispatch:',
  'environment: production',
  'confirm_send',
  'PUSH_SMOKE_ANDROID_TOKEN',
  'PUSH_SMOKE_IOS_TOKEN',
  'FCM_SERVICE_ACCOUNT_JSON',
  'APNS_PRIVATE_KEY_P8',
  'production-push-smoke.js',
])if(!smoke.includes(term))throw new Error('push smoke workflow missing: '+term);
for(const term of [
  'workflow_dispatch:',
  'environment: production',
  'confirm_delivery',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PUSH_WORKER_PLATFORM',
  'PUSH_CLAIM_LIMIT',
  'run-price-alert-push-worker.js',
])if(!worker.includes(term))throw new Error('push worker workflow missing: '+term);
if(/^\s*schedule:/m.test(smoke)||/^\s*schedule:/m.test(worker)){
  throw new Error('production push workflows must remain manual until external activation');
}
if(!worker.includes('tee artifacts/production-push-worker-summary.json')){
  throw new Error('worker must retain aggregate sanitized evidence');
}
console.log('production push workflow contract PASS');
