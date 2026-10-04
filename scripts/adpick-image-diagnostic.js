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
for (const query of queries) {
  const products = await provider.search(query, { limit: 5, trackingId: "kkokkapick_image_diagnostic" });
  const probes = await Promise.all(products.map(product => probeImage(product.imageUrl)));
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
const summary = {
  generatedAt: new Date().toISOString(),
  sourceFields: [...sourceFields].sort(),
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
