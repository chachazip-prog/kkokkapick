const fs=require('fs');
for(const p of ['.github/workflows/sync-adpick.yml','.github/workflows/sync-adpick-biz.yml']){
 const s=fs.readFileSync(p,'utf8');
 if(!s.includes("if: github.repository == 'chachazip-prog/kkokkapick'"))throw new Error(p+' missing canonical-repository guard');
 if(!s.includes('git fetch origin main')||!s.includes('git rebase origin/main')||!s.includes('git push origin HEAD:main'))throw new Error(p+' missing race-safe explicit main update');
 if(!s.includes('cancel-in-progress: false'))throw new Error(p+' must serialize provider sync');
}
console.log('provider sync workflow safety PASS');
