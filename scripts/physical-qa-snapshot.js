const fs = require('fs');
const path = require('path');

function readText(file) {
  return fs.readFileSync(file, 'utf8').trim();
}
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const flutterSourceSha = readText('flutter-preview/SOURCE_REVISION');
const preview = readJson('flutter-preview/release-evidence.json');
const catalog = readJson('data/catalog.json');
const quality = readJson('catalog-quality-report.json');

if (!flutterSourceSha || flutterSourceSha !== preview.sourceSha) {
  throw new Error('preview_source_mismatch');
}
if (!catalog.syncedAt || catalog.syncedAt !== quality.syncedAt) {
  throw new Error('catalog_evidence_mismatch');
}

const products = Array.isArray(catalog.products) ? catalog.products : [];
const report = {
  generatedAt: new Date().toISOString(),
  status: 'PREPARED_NOT_EXECUTED',
  flutter: {
    sourceSha: flutterSourceSha,
    previewSourceRef: preview.sourceRef,
    previewWorkflowRunId: String(preview.workflowRunId),
  },
  catalog: {
    syncedAt: catalog.syncedAt,
    sourceCount: catalog.sourceCount ?? quality.sourceProducts ?? null,
    canonicalProducts: quality.canonicalProducts ?? products.length,
    canonicalImageProducts: quality.canonicalImageProducts ?? null,
    canonicalImageRatePct: quality.canonicalImageRatePct ?? null,
    multiImageProducts: quality.multiImageProducts ?? null,
    channelPrefixedDisplayTitles: quality.channelPrefixedDisplayTitles ?? null,
  },
  requiredMatrix: {
    logicalWidths: [320, 360, 390, 430],
    textScales: [1, 2],
    targets: [
      'deployed Flutter Preview',
      'iOS Safari or installed iOS build',
      'Android installed build',
    ],
  },
  evidenceReminder: 'Record device/OS/browser or build identifier, tester, date, screenshots/recording, and this snapshot with every physical QA execution.',
};

const output = process.env.PHYSICAL_QA_SNAPSHOT_REPORT || 'artifacts/physical-qa-snapshot.json';
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
