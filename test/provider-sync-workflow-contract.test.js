const fs=require('fs');
for(const p of ['.github/workflows/sync-adpick.yml','.github/workflows/sync-adpick-biz.yml']){
 const s=fs.readFileSync(p,'utf8');
 if(!s.includes("if: github.repository == 'chachazip-prog/kkokkapick'"))throw new Error(p+' missing canonical-repository guard');
 if(!s.includes('git fetch origin main')||!s.includes('git push origin HEAD:main'))throw new Error(p+' missing explicit main update');
 if(!s.includes('concurrency:'))throw new Error(p+' must define provider sync concurrency');
 if(!s.includes('group: adpick-biz-sync'))throw new Error(p+' must use the provider sync concurrency group');
 if(!s.includes('cancel-in-progress: true'))throw new Error(p+' must prefer the newest provider sync revision');
 if(p.endsWith('sync-adpick.yml')){
   if(!s.includes('main moved during provider sync; refusing stale catalog publication'))throw new Error(p+' must reject stale generated catalog');
   if(s.includes('git rebase origin/main'))throw new Error(p+' must not rebase stale provider data onto a newer main');
 }
 if(p.endsWith('sync-adpick-biz.yml')){
   if(!s.includes('Refusing legacy discovery plan'))throw new Error(p+' must reject legacy discovery plan');
   if(!s.includes('main moved during provider sync; refusing stale catalog publication'))throw new Error(p+' must reject stale generated catalog');
   if(!s.includes('cron: "43 * * * *"'))throw new Error(p+' must refresh expiring product images every hour');
   if(!s.includes('ADPICK_MIN_IMAGE_HEALTH_RATE: "0.8"'))throw new Error(p+' must enforce live image health before publication');
   if(!s.includes('Guard catalog coverage before publication')||!s.includes('ADPICK_MIN_SOURCE_PRODUCTS: "300"')||!s.includes('ADPICK_MIN_CANONICAL_PRODUCTS: "250"')||!s.includes('ADPICK_MIN_PREVIOUS_RATIO: "0.65"'))throw new Error(p+' must reject severe catalog coverage collapse');
   if(!s.includes('Verify catalog image health after publish')||!s.includes('post-publish-catalog-image-health'))throw new Error(p+' must verify and retain image health after publication');
   if(!s.includes('paths:')||!s.includes('.github/workflows/sync-adpick-biz.yml'))throw new Error(p+' must run once when sync policy lands on main');
   if(s.includes('git rebase origin/main'))throw new Error(p+' must not rebase stale provider data onto a newer main');
 }
}
console.log('provider sync workflow safety PASS');
