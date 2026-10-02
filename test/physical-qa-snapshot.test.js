const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kkokkapick-physical-qa-'));
const output = path.join(dir, 'snapshot.json');
execFileSync(process.execPath, ['scripts/physical-qa-snapshot.js'], {
  env: { ...process.env, PHYSICAL_QA_SNAPSHOT_REPORT: output },
  stdio: 'pipe',
});
const snapshot = JSON.parse(fs.readFileSync(output, 'utf8'));
const source = fs.readFileSync('flutter-preview/SOURCE_REVISION', 'utf8').trim();
const preview = JSON.parse(fs.readFileSync('flutter-preview/release-evidence.json', 'utf8'));
const quality = JSON.parse(fs.readFileSync('catalog-quality-report.json', 'utf8'));

if (snapshot.status !== 'PREPARED_NOT_EXECUTED') throw new Error('snapshot must not claim QA execution');
if (snapshot.flutter.sourceSha !== source || source !== preview.sourceSha) throw new Error('Flutter source mismatch');
if (snapshot.catalog.syncedAt !== quality.syncedAt) throw new Error('Catalog evidence mismatch');
if (JSON.stringify(snapshot.requiredMatrix.logicalWidths) !== JSON.stringify([320,360,390,430])) throw new Error('release widths missing');
if (JSON.stringify(snapshot.requiredMatrix.textScales) !== JSON.stringify([1,2])) throw new Error('text scale matrix missing');
if (!snapshot.requiredMatrix.targets.some(x => x.includes('iOS'))) throw new Error('iOS target missing');
if (!snapshot.requiredMatrix.targets.some(x => x.includes('Android'))) throw new Error('Android target missing');
console.log('physical QA snapshot contract PASS');
