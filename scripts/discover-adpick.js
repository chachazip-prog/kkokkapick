import { classifyCatalogRelevance } from "../src/apparel-relevance.js";
import { catalogCacheWindow } from "../src/provider-product-facts.js";
import fs from "node:fs/promises";
import { AdpickBizProvider } from "../src/adpick-biz-provider.js";
import { validateProductImages } from "../src/image-health.js";
import { ADPICK_DISCOVERY_QUERIES as queries, ADPICK_SEARCH_LIMIT, ADPICK_DISCOVERY_PACING_MS } from "../src/adpick-discovery-plan.js";

const apiKey = process.env.ADPICK_BIZ_API_KEY;
if (!apiKey) throw new Error("Missing ADPICK_BIZ_API_KEY");

const sourceFields = new Set();
const provider = new AdpickBizProvider({ apiKey, fetchImpl: async (url, options) => {
  const response = await fetch(url, options);
  if (response.ok) {
    const payload = await response.clone().json();
    const rows = Array.isArray(payload) ? payload : (payload?.list ?? payload?.data ?? payload?.items ?? []);
    if (Array.isArray(rows)) rows.forEach(row => Object.keys(row || {}).forEach(key => sourceFields.add(key)));
  }
  return response;
} });
const map = new Map();
const queryDiagnostics = [];
for (const q of queries) {
  const products = await provider.search(q, { limit: ADPICK_SEARCH_LIMIT });
  const before = map.size;
  for (const p of products) {
    const key = p.externalProductId || p.affiliateUrl;
    if (!map.has(key)) map.set(key, p);
  }
  const diagnostic = {
    query: q,
    returned: products.length,
    newUnique: map.size - before,
    cumulativeUnique: map.size,
  };
  queryDiagnostics.push(diagnostic);
  console.log("[adpick-query]", JSON.stringify(diagnostic));
  // Conservative pacing until the current account's documented quota is verified.
  await new Promise(r => setTimeout(r, ADPICK_DISCOVERY_PACING_MS));
}
console.log("[adpick-discovery-summary]", JSON.stringify({
  queries: queryDiagnostics.length,
  returnedTotal: queryDiagnostics.reduce((sum, item) => sum + item.returned, 0),
  uniqueBeforeApparelFilter: map.size,
  zeroResultQueries: queryDiagnostics.filter(item => item.returned === 0).map(item => item.query),
  zeroNewUniqueQueries: queryDiagnostics.filter(item => item.newUnique === 0).map(item => item.query),
}));

const products = [...map.values()].filter(p => classifyCatalogRelevance(p).eligible).map(p => ({...p,domain:classifyCatalogRelevance(p).domain}));

// Fail before image validation and file writes when the provider search corpus is
// obviously degraded. The workflow-level coverage guard remains the final
// publication gate, but this keeps the checked-out healthy baseline untouched
// and makes provider collapse the explicit failure reason.
const minDiscoveryUnique = Number(process.env.ADPICK_MIN_DISCOVERY_UNIQUE || 250);
if (map.size < minDiscoveryUnique) {
  console.error(JSON.stringify({
    providerCoverage: {
      returnedTotal: queryDiagnostics.reduce((sum, item) => sum + item.returned, 0),
      uniqueBeforeApparelFilter: map.size,
      apparelProducts: products.length,
      zeroResultQueries: queryDiagnostics.filter(item => item.returned === 0).map(item => item.query),
    },
    minDiscoveryUnique,
  }, null, 2));
  throw new Error(`ADPICK provider search corpus degraded: ${map.size} unique < ${minDiscoveryUnique}`);
}

const validated = await validateProductImages(products, {
  timeoutMs: Number(process.env.ADPICK_IMAGE_TIMEOUT_MS || 5000),
  concurrency: Number(process.env.ADPICK_IMAGE_CONCURRENCY || 5),
});
const imageHealth = {
  checked: validated.length,
  ok: validated.filter(p => p.imageHealth?.ok).length,
  failed: validated.filter(p => !p.imageHealth?.ok).length,
  statuses: validated.reduce((acc, p) => {
    const key = String(p.imageHealth?.status ?? p.imageHealth?.reason ?? "unknown");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
};
imageHealth.rate = imageHealth.checked ? imageHealth.ok / imageHealth.checked : 0;
const minImageHealthRate = Number(process.env.ADPICK_MIN_IMAGE_HEALTH_RATE || 0.8);
if (imageHealth.rate < minImageHealthRate) {
  console.error(JSON.stringify({ imageHealth, minImageHealthRate }, null, 2));
  throw new Error(`Refusing catalog publication: live image health ${(imageHealth.rate * 100).toFixed(1)}% < ${(minImageHealthRate * 100).toFixed(1)}%`);
}
const productFacts = {
  materialPresent: validated.filter(p => Boolean(p.material)).length,
  availableSizesPresent: validated.filter(p => p.availableSizes?.length).length,
  sourceFields: [...sourceFields].sort(),
};
const acceptedQueries = queries.map(query => ({ query, acceptedUnique: products.filter(p => p.query === query).length }));
const safeProducts = validated.map(({ imageHealth: _imageHealth, ...product }) => product);
await fs.mkdir("data", { recursive: true });
await fs.writeFile("data/adpick-biz-products.json", JSON.stringify({
  source: "adpick_biz",
  ...catalogCacheWindow(safeProducts.map(p => p.checkedAt).filter(Boolean).sort()[0] || new Date().toISOString()),
  queries,
  count: safeProducts.length,
  imageHealth,
  acceptedQueries,
  productFacts,
  products: safeProducts
}, null, 2) + "\n");
console.log(`Saved ${safeProducts.length} unique ADPICK BIZ products; images ${imageHealth.ok}/${imageHealth.checked} healthy`);

await fs.mkdir("artifacts", { recursive: true });
await fs.writeFile("artifacts/adpick-image-diagnostic.json", JSON.stringify({generatedAt:new Date().toISOString(),...productFacts,probed:imageHealth.checked,ok:imageHealth.ok,failed:imageHealth.failed,statuses:imageHealth.statuses},null,2)+"\n");
console.log("[adpick-source-facts]", JSON.stringify(productFacts));
