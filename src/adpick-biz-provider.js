export class AdpickBizProvider {
  constructor({ apiKey, fetchImpl = fetch, baseUrl = "https://biz.adpick.co.kr/api" }) {
    if (!apiKey) throw new Error("ADPICK_BIZ_API_KEY is required");
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async search(query, { limit = 20, trackingId = "kkokkapick_catalog" } = {}) {
    const url = new URL(`${this.baseUrl}/${encodeURIComponent(this.apiKey)}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", String(limit));
    if (trackingId) url.searchParams.set("p_data", trackingId);
    const res = await this.fetchImpl(url, { headers: { accept: "application/json" } });
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
