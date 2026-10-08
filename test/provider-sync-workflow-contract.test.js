const fs=require('fs');
for(const p of ['.github/workflows/sync-adpick.yml','.github/workflows/sync-adpick-biz.yml']){
 const s=fs.readFileSync(p,'utf8');
 if(!s.includes("if: github.repository == 'chachazip-prog/kkokkapick'"))throw new Error(p+' missing canonical-repository guard');
 if(!s.includes('git fetch origin main')||!s.includes('git push origin HEAD:main'))throw new Error(p+' missing explicit main update');
 if(!s.includes('concurrency:'))throw new Error(p+' must define provider sync concurrency');
 if(p.endsWith('sync-adpick-biz.yml')){
   if(!s.includes('group: adpick-biz-sync'))throw new Error(p+' must use the BIZ sync concurrency group');
   if(!s.includes('cancel-in-progress: true'))throw new Error(p+' must prefer the newest BIZ sync revision');
 } else if(!s.includes('cancel-in-progress: false'))throw new Error(p+' must serialize legacy provider sync');
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
   if(!s.includes('Verify all original catalog images before publication')||s.indexOf('Verify all original catalog images before publication')>s.indexOf('name: Commit catalog')||!s.includes('IMAGE_HEALTH_ALL: \"1\"'))throw new Error(p+' must reject bad images before publication');
   if(!s.includes('Verify catalog image health after publish')||!s.includes('post-publish-catalog-image-health'))throw new Error(p+' must verify and retain image health after publication');
   if(!s.includes('paths:')||!s.includes('.github/workflows/sync-adpick-biz.yml'))throw new Error(p+' must run once when sync policy lands on main');
   if(s.includes('git rebase origin/main'))throw new Error(p+' must not rebase stale provider data onto a newer main');
 }
}
// Execute the actual legacy publication step with an isolated git executable.
// String checks alone previously passed when a literal \\n left the guard/push
// inside a shell comment, so publication and stale-head refusal must be observed.
const assert=require('node:assert/strict');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const legacy=fs.readFileSync('.github/workflows/sync-adpick.yml','utf8');
for(const workflow of ['.github/workflows/sync-adpick.yml','.github/workflows/sync-adpick-biz.yml']){
 const expression=fs.readFileSync(workflow,'utf8').match(/^    if: (.+)$/m)?.[1];
 assert.ok(expression,workflow+' must guard the entire job before provider access');
 for(const [repository,ref,allowed] of [
  ['chachazip-prog/kkokkapick','refs/heads/main',true],
  ['chachazip-prog/kkokkapick','refs/heads/codex/release-ui-rebuild',false],
  ['chachazip-prog/kkokkapick','refs/tags/release',false],
  ['fork/kkokkapick','refs/heads/main',false],
 ])assert.equal(vm.runInNewContext(expression,{github:{repository,ref}}),allowed,workflow+' provider sync job boundary');
}
const block=legacy.split('      - name: Commit refreshed catalog\n        run: |\n')[1];
assert.ok(block,'Legacy publication step must exist');
const script=block.split('\n').map(line=>line.startsWith('          ')?line.slice(10):line).join('\n');
assert.equal(spawnSync('bash',['-n'],{input:script,encoding:'utf8'}).status,0,'Legacy publication shell syntax');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'kkokkapick-sync-workflow-'));
try{
 const executable=path.join(fixture,'git');
 fs.writeFileSync(executable,`#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$SYNC_CALL_LOG"
case "$*" in
  "diff --quiet -- data/adpick-products.json") exit "$SYNC_DIFF_STATUS" ;;
  "rev-parse origin/main") printf '%s\\n' "$SYNC_REMOTE_SHA" ;;
esac
exit 0
`,{mode:0o755});
 for(const [name,remoteSha,diffStatus,expectedStatus,shouldPush] of [
  ['matching-main','reviewed-code',1,0,true],
  ['main-moved','newer-code',1,1,false],
  ['unchanged-catalog','reviewed-code',0,0,false],
 ]){
  const callLog=path.join(fixture,name+'.log');
  const result=spawnSync('bash',['-c',script],{cwd:fixture,encoding:'utf8',env:{
   PATH:fixture+':/usr/bin:/bin',GITHUB_SHA:'reviewed-code',SYNC_REMOTE_SHA:remoteSha,
   SYNC_DIFF_STATUS:String(diffStatus),SYNC_CALL_LOG:callLog,
  }});
  const calls=fs.readFileSync(callLog,'utf8').trim().split('\n');
  assert.equal(result.status,expectedStatus,name+' exit status: '+result.stderr);
  assert.equal(calls.includes('push origin HEAD:main'),shouldPush,name+' publication');
  assert.equal(calls.includes('rev-parse origin/main'),Boolean(diffStatus),name+' main-head comparison');
  if(name==='main-moved')assert.match(result.stdout,/main moved during provider sync/);
 }
}finally{fs.rmSync(fixture,{recursive:true,force:true})}
console.log('provider sync workflow safety and actual publication behavior PASS');
