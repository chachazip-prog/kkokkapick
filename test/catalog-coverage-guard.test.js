import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'kkokkapick-coverage-'));
function write(name,source,canonical){
  const sp=path.join(dir,name+'-source.json');
  const cp=path.join(dir,name+'-catalog.json');
  fs.writeFileSync(sp,JSON.stringify({count:source,products:Array(source).fill({})}));
  fs.writeFileSync(cp,JSON.stringify({productCount:canonical,products:Array(canonical).fill({})}));
  return [sp,cp];
}
const [baseS,baseC]=write('base',564,516);
const [goodS,goodC]=write('good',520,480);
const [badS,badC]=write('bad',79,78);

function run(source,catalog){
  return spawnSync(process.execPath,['scripts/catalog-coverage-guard.js'],{
    encoding:'utf8',
    env:{
      ...process.env,
      CATALOG_CURRENT_SOURCE:source,
      CATALOG_CURRENT_CANONICAL:catalog,
      CATALOG_BASELINE_SOURCE:baseS,
      CATALOG_BASELINE_CANONICAL:baseC,
      ADPICK_MIN_SOURCE_PRODUCTS:'300',
      ADPICK_MIN_CANONICAL_PRODUCTS:'250',
      ADPICK_MIN_PREVIOUS_RATIO:'0.65',
    }
  });
}
const good=run(goodS,goodC);
if(good.status!==0||!good.stdout.includes('"status": "PASS"'))throw new Error('healthy catalog must pass');
const bad=run(badS,badC);
if(bad.status===0||!bad.stdout.includes('"status": "FAIL"'))throw new Error('collapsed catalog must fail');
if(!bad.stdout.includes('source_absolute')||!bad.stdout.includes('canonical_absolute')||!bad.stdout.includes('source_ratio'))throw new Error('collapse reasons missing');

// A low already-published baseline must not lower the absolute release floor.
const lowBaseS=path.join(dir,'low-source.json');
const lowBaseC=path.join(dir,'low-catalog.json');
fs.writeFileSync(lowBaseS,JSON.stringify({count:79,products:[]}));
fs.writeFileSync(lowBaseC,JSON.stringify({productCount:78,products:[]}));
const lowBaseline=spawnSync(process.execPath,['scripts/catalog-coverage-guard.js'],{
  encoding:'utf8',
  env:{
    ...process.env,
    CATALOG_CURRENT_SOURCE:badS,
    CATALOG_CURRENT_CANONICAL:badC,
    CATALOG_BASELINE_SOURCE:lowBaseS,
    CATALOG_BASELINE_CANONICAL:lowBaseC,
    ADPICK_MIN_SOURCE_PRODUCTS:'300',
    ADPICK_MIN_CANONICAL_PRODUCTS:'250',
    ADPICK_MIN_PREVIOUS_RATIO:'0.65',
  }
});
if(lowBaseline.status===0)throw new Error('collapsed baseline must not ratchet release floor downward');
console.log('catalog coverage guard PASS');
