const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kkokkapick-migrations-'));
const out = path.join(dir,'manifest.json');
execFileSync(process.execPath,['scripts/production-migration-manifest.js'],{
  env:{...process.env,PRODUCTION_MIGRATION_MANIFEST:out},
  stdio:'pipe'
});
const m=JSON.parse(fs.readFileSync(out,'utf8'));
if(m.count!==31)throw new Error('expected 31 ordered migrations');
if(m.first!=='001_initial.sql')throw new Error('unexpected first migration');
if(m.latest!=='031_push_delivery_target_fanout.sql')throw new Error('unexpected latest migration');
if(m.entries.some((e,i)=>e.sequence!==i+1||!/^[a-f0-9]{64}$/.test(e.sha256)))throw new Error('invalid migration manifest entry');
console.log('production migration manifest PASS');
