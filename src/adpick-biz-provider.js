import { providerProductFacts } from "./provider-product-facts.js";
export class AdpickBizProvider {
  constructor({ apiKey, fetchImpl = fetch, baseUrl = "https://biz.adpick.co.kr/api", waitImpl = ms => new Promise(resolve => setTimeout(resolve, ms)), retryLimit = 2 }) {
    if (!apiKey) throw new Error("ADPICK_BIZ_API_KEY is required");
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.waitImpl = waitImpl;
    this.retryLimit = Math.max(0, Math.min(2, retryLimit));
  }

  async search(query, { limit = 20, trackingId = "kkokkapick_catalog" } = {}) {
    const url = new URL(`${this.baseUrl}/${encodeURIComponent(this.apiKey)}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", String(limit));
    if (trackingId) url.searchParams.set("p_data", trackingId);
    let res;
    for (let attempt = 0; attempt <= this.retryLimit; attempt++) {
      res = await this.fetchImpl(url, { headers: { accept: "application/json" } });
      if (res.status !== 429 || attempt === this.retryLimit) break;
      const header = res.headers?.get?.("retry-after");
      const seconds = header && /^\d+(?:\.\d+)?$/.test(header) ? Number(header) : null;
      const date = header && seconds === null ? Date.parse(header) : NaN;
      const requested = seconds !== null ? seconds * 1000 : Number.isFinite(date) ? date - Date.now() : 30000 * (attempt + 1);
      const delay = Math.max(1000, requested);
      await res.body?.cancel?.().catch(() => {});
      if (delay > 60000) throw new Error("ADPICK BIZ rate limit requires a later retry");
      await this.waitImpl(delay);
    }
    if (!res.ok) throw new Error(`ADPICK BIZ search failed: ${res.status}`);
    return this.normalizeResponse(await res.json(), query);
  }

  normalizeResponse(payload, query) {
    const rows = Array.isArray(payload) ? payload : (payload?.list ?? payload?.data ?? payload?.items ?? []);
    return rows.map(raw => this.normalize(raw, query)).filter(p => p.name && p.affiliateUrl);
  }

  normalize(raw, query) {
    return {
      provider: "adpick_biz",
      ...providerProductFacts(raw),
      query,
      name: String(raw.title ?? raw.product_name ?? raw.name ?? "").trim(),
      imageUrl: raw.photo ?? raw.image ?? raw.image_url ?? null,
      merchant: raw.cp_name ?? raw.mall_name ?? raw.mall ?? null,
      merchantDomain: raw.mall ?? null,
      price: this.parseWon(raw.price_sale ?? raw.price),
      originalPrice: this.parseWon(raw.price_org ?? raw.original_price),
      commissionText: raw.commission ?? null,
      affiliateUrl: raw.commissionlink ?? raw.buyurl ?? raw.link ?? null,
      externalProductId: String(raw.product_id ?? raw.id ?? this.stableKey(raw)),
      checkedAt: new Date().toISOString()
    };
  }

  parseWon(v) {
    const digits = String(v ?? "").replace(/[^0-9]/g, "");
    return digits ? Number(digits) : null;
  }

  stableKey(raw) {
    let h = 2166136261;
    const s = String(raw.commissionlink ?? raw.buyurl ?? raw.title ?? raw.product_name ?? "");
    for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return "adpickbiz_" + (h >>> 0).toString(16);
  }
}
