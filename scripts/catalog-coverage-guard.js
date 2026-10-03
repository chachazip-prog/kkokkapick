import fs from 'node:fs';

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
function number(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`invalid_${name}`);
  return n;
}

const currentSourcePath = process.env.CATALOG_CURRENT_SOURCE || 'data/adpick-biz-products.json';
const currentCatalogPath = process.env.CATALOG_CURRENT_CANONICAL || 'data/catalog.json';
const baselineSourcePath = process.env.CATALOG_BASELINE_SOURCE || '';
const baselineCatalogPath = process.env.CATALOG_BASELINE_CANONICAL || '';

const minSource = number(process.env.ADPICK_MIN_SOURCE_PRODUCTS || 300, 'min_source');
const minCanonical = number(process.env.ADPICK_MIN_CANONICAL_PRODUCTS || 250, 'min_canonical');
const minPreviousRatio = number(process.env.ADPICK_MIN_PREVIOUS_RATIO || 0.65, 'min_previous_ratio');
if (minPreviousRatio <= 0 || minPreviousRatio > 1) throw new Error('invalid_min_previous_ratio');

const currentSource = readJson(currentSourcePath);
const currentCatalog = readJson(currentCatalogPath);
const currentSourceCount = number(currentSource.count ?? currentSource.products?.length, 'current_source');
const currentCanonicalCount = number(currentCatalog.productCount ?? currentCatalog.products?.length, 'current_canonical');

let previousSourceCount = null;
let previousCanonicalCount = null;
if (baselineSourcePath && fs.existsSync(baselineSourcePath)) {
  const baseline = readJson(baselineSourcePath);
  previousSourceCount = number(baseline.count ?? baseline.products?.length, 'previous_source');
}
if (baselineCatalogPath && fs.existsSync(baselineCatalogPath)) {
  const baseline = readJson(baselineCatalogPath);
  previousCanonicalCount = number(baseline.productCount ?? baseline.products?.length, 'previous_canonical');
}

const failures = [];
if (currentSourceCount < minSource) {
  failures.push(`source_absolute:${currentSourceCount}<${minSource}`);
}
if (currentCanonicalCount < minCanonical) {
  failures.push(`canonical_absolute:${currentCanonicalCount}<${minCanonical}`);
}
if (previousSourceCount != null && previousSourceCount >= minSource) {
  const floor = Math.floor(previousSourceCount * minPreviousRatio);
  if (currentSourceCount < floor) {
    failures.push(`source_ratio:${currentSourceCount}<${floor}`);
  }
}
if (previousCanonicalCount != null && previousCanonicalCount >= minCanonical) {
  const floor = Math.floor(previousCanonicalCount * minPreviousRatio);
  if (currentCanonicalCount < floor) {
    failures.push(`canonical_ratio:${currentCanonicalCount}<${floor}`);
  }
}

const result = {
  status: failures.length ? 'FAIL' : 'PASS',
  current: { sourceProducts: currentSourceCount, canonicalProducts: currentCanonicalCount },
  baseline: { sourceProducts: previousSourceCount, canonicalProducts: previousCanonicalCount },
  policy: { minSourceProducts: minSource, minCanonicalProducts: minCanonical, minPreviousRatio },
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) {
  throw new Error('Refusing catalog publication: coverage gate failed');
}
