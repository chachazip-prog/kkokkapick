import { providerProductFacts } from "./provider-product-facts.js";
import { ProviderAdapter } from "./provider-adapter.js";

/**
 * ADPICK ShoppingMate recommended-products JSON adapter.
 * The API URL is treated as a secret because it may contain account identifiers.
 */
export class AdpickProvider extends ProviderAdapter {
  constructor({ apiUrl, fetchImpl = fetch }) {
    super({ storagePolicy: "ttl_cache", cacheTtlMinutes: 60 });
    this.apiUrl = apiUrl;
    this.fetchImpl = fetchImpl;
  }

  async fetchRecommended() {
    if (!this.apiUrl) throw new Error("ADPICK_API_URL is required");
    const response = await this.fetchImpl(this.apiUrl, {
      headers: { accept: "application/json" }
    });
    if (!response.ok) throw new Error(`ADPICK request failed: ${response.status}`);
    const payload = await response.json();
    return this.normalizeResponse(payload);
  }

  normalizeResponse(payload) {
    const themes = Array.isArray(payload) ? payload : [payload];
    return themes.flatMap(theme =>
      (theme?.list ?? []).map(item => this.normalize(item, theme))
    );
  }

  normalize(raw, theme = {}) {
    const salePrice = this.parseWon(raw.price_sale);
    const originalPrice = this.parseWon(raw.price_org);
    return {
      provider: "adpick",
      ...providerProductFacts(raw),
      externalProductId: this.stableKey(raw),
      themeCode: theme.theme_code ?? null,
      themeTitle: theme.title ?? null,
      themeDescription: theme.description ?? null,
      name: String(raw.product_name ?? "").trim(),
      imageUrl: raw.photo || null,
      merchantDomain: raw.mall || null,
      merchant: raw.mall_name || raw.mall || null,
      merchantIconUrl: raw.mall_icon || null,
      price: salePrice > 0 ? salePrice : null,
      originalPrice: originalPrice > 0 ? originalPrice : null,
      priceStatus: salePrice > 0 ? "known" : "check_at_merchant",
      commissionText: raw.commission || null,
      commissionRate: this.parseCommission(raw.commission),
      affiliateUrl: raw.buyurl || null,
      checkedAt: new Date().toISOString()
    };
  }

  stableKey(raw) {
    // buyurl usually contains provider offer + destination and is more stable
    // than a title/price combination. No affiliate URL is exposed to the client as an ID.
    return this.hashish(raw.buyurl || [raw.mall, raw.product_name].join("|"));
  }

  parseWon(value) {
    if (typeof value === "number") return value;
    const digits = String(value ?? "").replace(/[^0-9]/g, "");
    return digits ? Number(digits) : 0;
  }

  parseCommission(value) {
    const match = String(value ?? "").match(/([0-9]+(?:\.[0-9]+)?)/);
    return match ? Number(match[1]) : null;
  }

  hashish(value) {
    // deterministic non-cryptographic key for MVP mapping
    let h = 2166136261;
    for (const ch of String(value ?? "")) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return "adpick_" + (h >>> 0).toString(16);
  }
}
