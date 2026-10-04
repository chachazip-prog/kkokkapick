import fs from "node:fs/promises";
import { AdpickBizProvider } from "../src/adpick-biz-provider.js";

const apiKey = process.env.ADPICK_BIZ_API_KEY;
if (!apiKey) throw new Error("Missing ADPICK_BIZ_API_KEY");

const queries = ["신생아 바디수트", "아기 상하복", "키즈 티셔츠"];
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
const timeoutMs = Number(process.env.IMAGE_DIAGNOSTIC_TIMEOUT_MS || 5000);

async function probeImage(url) {
  if (!url) return { ok: false, status: null, contentType: "", host: null, reason: "missing" };
  let host = null;
  try { host = new URL(url).host; } catch { return { ok: false, status: null, contentType: "", host: null, reason: "invalid_url" }; }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; KKOKKAPICKProviderDiagnostic/1.0)",
        "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      }
    });
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    await response.body?.cancel().catch(() => {});
    return {
      ok: response.ok && contentType.startsWith("image/"),
      status: response.status,
      contentType,
      host
    };
  } catch (error) {
    return { ok: false, status: null, contentType: "", host, reason: error?.name || "fetch_error" };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
// Public provider image URLs only: enough to compare runner and browser access.
// Never include API request URLs, credentials or affiliate links in evidence.
const freshImageSamples = [];
for (const query of queries) {
  const products = await provider.search(query, { limit: 5, trackingId: "kkokkapick_image_diagnostic" });
  const probes = await Promise.all(products.map(product => probeImage(product.imageUrl)));
  const sample = products.find(product => {
    try { const url = new URL(product.imageUrl); return url.protocol === 'https:' && !url.username && !url.password && !url.hash && !url.port && url.searchParams.getAll('code').length === 1 && url.hostname === 'd2iaagr1j041pi.cloudfront.net' && url.pathname === '/apis/search_img.php' && /^\d+$/.test(url.searchParams.get('code') || '') && [...url.searchParams.keys()].every(key => key === 'code'); } catch { return false; }
  });
  if (sample) freshImageSamples.push({ imageUrl: 'https://d2iaagr1j041pi.cloudfront.net/apis/search_img.php?code=' + new URL(sample.imageUrl).searchParams.get('code'), observedAt: sample.checkedAt });
  results.push({
    query,
    products: products.length,
    imagesPresent: products.filter(p => Boolean(p.imageUrl)).length,
    materialPresent: products.filter(p => Boolean(p.material)).length,
    availableSizesPresent: products.filter(p => p.availableSizes?.length).length,
    factFields: [...new Set(products.flatMap(p => Object.values(p.productFactFields || {}).filter(Boolean)))],
    probes
  });
}

const flat = results.flatMap(r => r.probes);
const catalog = JSON.parse(await fs.readFile('data/catalog.json', 'utf8'));
const existingImageSamples = [...new Set((catalog.products || []).map(p => p.imageUrl).filter(Boolean))].slice(0, 3);
const existingProbes = await Promise.all(existingImageSamples.map(probeImage));
const summary = {
  generatedAt: new Date().toISOString(),
  sourceFields: [...sourceFields].sort(),
  freshImageSamples,
  existingCatalog: { syncedAt: catalog.syncedAt, probed: existingProbes.length, ok: existingProbes.filter(p => p.ok).length, probes: existingProbes },
  queries: results.map(r => ({ query: r.query, products: r.products, imagesPresent: r.imagesPresent, materialPresent: r.materialPresent, availableSizesPresent: r.availableSizesPresent, factFields: r.factFields })),
  probed: flat.length,
  ok: flat.filter(p => p.ok).length,
  failed: flat.filter(p => !p.ok).length,
  hosts: [...new Set(flat.map(p => p.host).filter(Boolean))],
  statuses: flat.reduce((acc, p) => {
    const key = String(p.status ?? p.reason ?? "unknown");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
  contentTypes: flat.reduce((acc, p) => {
    const key = p.contentType || "(none)";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})
};

await fs.mkdir("artifacts", { recursive: true });
await fs.writeFile("artifacts/adpick-image-diagnostic.json", JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
if (summary.probed === 0) throw new Error("No fresh ADPICK images were returned");
