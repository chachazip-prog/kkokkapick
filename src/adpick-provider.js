import { ProviderAdapter } from "./provider-adapter.js";

export class AdpickProvider extends ProviderAdapter {
  constructor({ apiKey, fetchImpl = fetch }) {
    super({ storagePolicy: "ttl_cache", cacheTtlMinutes: 60 });
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
    this.baseUrl = "https://biz.adpick.co.kr/api";
  }

  async search(query, { limit = 20, trackingId = "" } = {}) {
    if (!this.apiKey) throw new Error("ADPICK_API_KEY is required");
    const safeLimit = Math.min(Math.max(limit, 1), 20);
    const url = new URL(`${this.baseUrl}/${encodeURIComponent(this.apiKey)}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", String(safeLimit));
    if (trackingId) url.searchParams.set("p_data", trackingId.slice(0, 50));
    const response = await this.fetchImpl(url);
    if (!response.ok) throw new Error(`Adpick search failed: ${response.status}`);
    const payload = await response.json();
    return (payload.data ?? []).map(item => this.normalize(item));
  }

  normalize(raw) {
    return {
      provider: "adpick",
      externalProductId: this.stableKey(raw),
      name: this.clean(raw.title),
      imageUrl: raw.photo || null,
      merchantCode: raw.cp_code || null,
      merchant: raw.cp_name || null,
      merchantIconUrl: raw.cp_icon || null,
      price: this.parseWon(raw.price),
      shippingFee: 0,
      affiliateUrl: raw.commissionlink || null,
      checkedAt: new Date().toISOString(),
      raw
    };
  }

  stableKey(raw) {
    return [raw.cp_code || "", this.clean(raw.title), this.parseWon(raw.price) ?? ""].join(":");
  }
  clean(value) { return String(value ?? "").replace(/<[^>]*>/g, "").trim(); }
  parseWon(value) {
    if (typeof value === "number") return value;
    const digits = String(value ?? "").replace(/[^0-9]/g, "");
    return digits ? Number(digits) : null;
  }
}
