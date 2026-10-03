const fs=require('fs');
const required=[
 'docs/account-data-inventory.md',
 'docs/production-activation-checklist.md',
 'docs/production-supabase-operator-runbook.md',
 'docs/production-verification-pack.md',
 'privacy.html','support.html','account-deletion.html',
 'flutter/pubspec.yaml'
];
for(const p of required)if(!fs.existsSync(p))throw new Error('release artifact missing: '+p);
const pub=fs.readFileSync('flutter/pubspec.yaml','utf8');
for(const dep of ['http:','shared_preferences:','flutter_secure_storage:','url_launcher:','app_links:','crypto:'])if(!pub.includes(dep))throw new Error('dependency inventory changed; review privacy/security impact: '+dep);
for(const p of [
  'scripts/production-migration-manifest.js','scripts/validate-production-verification.js',
  'scripts/production-email-auth-smoke.js','.github/workflows/production-supabase-activation.yml',
  'scripts/production-push-smoke.js','scripts/run-price-alert-push-worker.js',
  '.github/workflows/production-push-verification.yml','.github/workflows/price-alert-push-worker.yml'
])if(!fs.existsSync(p))throw new Error('production activation artifact missing: '+p);
const privacy=fs.readFileSync('docs/technical-privacy-inventory.md','utf8');
for(const term of ['Child age/months, height, weight','Push token','Opaque commercial session key','Provider catalog/product/offer data'])if(!privacy.includes(term))throw new Error('technical privacy inventory missing: '+term);
for(const page of ['privacy.html','support.html','account-deletion.html']){
 const s=fs.readFileSync(page,'utf8');
 if(!/release|draft|준비|초안/i.test(s))throw new Error(page+' must remain clearly non-final until legal identity is supplied');
}
console.log('release artifact/privacy contract PASS');
