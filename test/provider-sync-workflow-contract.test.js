const fs=require('fs');
for(const p of ['.github/workflows/sync-adpick.yml','.github/workflows/sync-adpick-biz.yml']){
 const s=fs.readFileSync(p,'utf8');
 if(!s.includes("if: github.repository == 'chachazip-prog/kkokkapick'"))throw new Error(p+' missing canonical-repository guard');
 if(!s.includes('git fetch origin main')||!s.includes('git push origin HEAD:main'))throw new Error(p+' missing explicit main update');
 if(!s.includes('cancel-in-progress: false'))throw new Error(p+' must serialize provider sync');
 if(p.endsWith('sync-adpick.yml')){
   if(!s.includes('main moved during provider sync; refusing stale catalog publication'))throw new Error(p+' must reject stale generated catalog');
   if(s.includes('git rebase origin/main'))throw new Error(p+' must not rebase stale provider data onto a newer main');
 }
 if(p.endsWith('sync-adpick-biz.yml')){
   if(!s.includes('Refusing legacy discovery plan'))throw new Error(p+' must reject legacy discovery plan');
   if(!s.includes('main moved during provider sync; refusing stale catalog publication'))throw new Error(p+' must reject stale generated catalog');
   if(!s.includes('cron: "43 */2 * * *"'))throw new Error(p+' must refresh expiring product images every two hours');
   if(!s.includes('ADPICK_MIN_IMAGE_HEALTH_RATE: "0.8"'))throw new Error(p+' must enforce live image health before publication');
   if(!s.includes('paths:')||!s.includes('.github/workflows/sync-adpick-biz.yml'))throw new Error(p+' must run once when sync policy lands on main');
   if(s.includes('git rebase origin/main'))throw new Error(p+' must not rebase stale provider data onto a newer main');
 }
}
console.log('provider sync workflow safety PASS');
