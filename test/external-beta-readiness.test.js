const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kkokkapick-external-beta-'));
const output = path.join(dir, 'snapshot.json');
execFileSync(process.execPath, ['scripts/external-beta-readiness.js'], {
  env: { ...process.env, EXTERNAL_BETA_READINESS_REPORT: output },
  stdio: 'pipe',
});
const snapshot = JSON.parse(fs.readFileSync(output, 'utf8'));
if (snapshot.status !== 'REPOSITORY_READY_EXTERNAL_BLOCKED') throw new Error('repository readiness snapshot must distinguish external blockers');
if (!snapshot.latestMigration?.startsWith('031_')) throw new Error('latest migration evidence changed');
if (snapshot.gates.length !== 10) throw new Error('expected ten external beta gates');
for (const gate of snapshot.gates) {
  if (gate.repository !== 'REPOSITORY_READY') throw new Error('repository gap remains: ' + gate.id);
  if (!['BLOCKED_EXTERNAL','HOLD_PRODUCT_OWNER'].includes(gate.external)) throw new Error('external gate was represented as complete: ' + gate.id);
}
const authGate = snapshot.gates.find(g => g.id === 'social_auth');
if (!authGate.requires.includes('Email/password is the only enabled method today')) throw new Error('auth truthfulness missing');
console.log('external beta readiness contract PASS');
