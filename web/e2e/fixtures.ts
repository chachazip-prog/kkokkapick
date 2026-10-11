import type { Page } from "@playwright/test";

/** Controlled synthetic fixtures only. Never bundled, published or counted as supplier goods. */
export const fixtureClock = Date.parse("2026-10-10T05:00:00Z");
const photo = (id: string, index = 0) =>
  `https://d2iaagr1j041pi.cloudfront.net/apis/search_img.php?code=ui-test-${id}-${index}`;
const offer = (
  id: string,
  merchant: string,
  price: number,
  facts: Record<string, unknown> = {},
) => ({
  merchant,
  price,
  originalPrice: null,
  affiliateUrl: `https://seller.example/${id}?ref=ui-test`,
  provider: "synthetic_ui_test",
  checkedAt: new Date(fixtureClock).toISOString(),
  ...facts,
});
export function fixtureCatalog() {
  return {
    groupingVersion: 2,
    storagePolicy: "ttl_cache",
    syncedAt: new Date(fixtureClock).toISOString(),
    expiresAt: new Date(fixtureClock + 24 * 60 * 60 * 1000).toISOString(),
    products: Array.from({ length: 44 }, (_, index) => {
      const id = `qa-${String(index + 1).padStart(2, "0")}`;
      const play = index >= 40;
      return {
        id,
        name:
          index === 0
            ? "[테스트 판매처] 아가방 우주복 (모자) QA123456789"
            : index === 1
              ? "아주 긴 테스트 상품명 ".repeat(12)
              : `${play ? "놀이 교구" : "아기 의류"} UI 검증용 ${index + 1}`,
        brand: index % 2 ? "검증용 브랜드" : "아가방",
        category: play ? "블록/교구" : "바디수트",
        stage: "베이비",
        domain: play ? (index % 2 ? "learning" : "toy") : "apparel",
        imageUrl: photo(id),
        imageUrls:
          index === 0 ? [photo(id), photo(id, 1), photo(id, 2)] : [photo(id)],
        fitStatus: index % 2 ? "unverified" : "verified",
        fitSource: index % 2 ? null : "official_brand_size_guide",
        material: index === 0 ? "테스트 제공 소재" : null,
        availableSizes: index === 0 ? ["80", "90"] : [],
        minPrice: 10000 + index * 100,
        maxPrice: 14000 + index * 100,
        ageEvidence:
          index === 41
            ? {
                minMonths: 6,
                maxMonths: 36,
                source: "provider",
                sourceField: "recommended_age",
                rawText: "검증용 제공 연령: 6–36개월",
              }
            : null,
        offers:
          index === 0
            ? [
                offer(id, "테스트 판매처 A", 10000, {
                  availableSizes: ["80"],
                  material: "테스트 제공 소재",
                }),
                offer(id, "테스트 판매처 A", 11000, { availableSizes: ["90"] }),
                offer(id, "테스트 판매처 B", 14000, { availableSizes: ["90"] }),
              ]
            : [offer(id, "테스트 판매처 A", 10000 + index * 100)],
      };
    }),
  };
}

export async function controlSource(
  page: Page,
  options: {
    expired?: boolean;
    unavailable?: boolean;
    blockedStorage?: boolean;
  } = {},
) {
  await page.clock.install({
    time: fixtureClock + (options.expired ? 91 : 1) * 60000,
  });
  await page.route("**/data/catalog.json?*", (route) =>
    options.unavailable
      ? route.fulfill({ status: 503, body: "{}" })
      : route.fulfill({ json: fixtureCatalog() }),
  );
  await page.route("**/data/price-history.json?*", (route) =>
    route.fulfill({ json: { events: [] } }),
  );
  await page.route("https://d2iaagr1j041pi.cloudfront.net/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640"><rect width="640" height="640" fill="#e6ebf3"/><text x="320" y="320" text-anchor="middle" font-size="26" fill="#344566">CONTROLLED UI TEST</text></svg>',
    }),
  );
  await page.addInitScript(({ blockedStorage }) => {
    const title = document.createElement("div");
    title.textContent = "CONTROLLED UI TEST · 실제 상품/출시 사진 검증 아님";
    title.setAttribute("data-test-only", "true");
    title.style.cssText =
      "position:fixed;left:0;top:0;z-index:100000;background:#20232b;color:white;font:10px sans-serif;padding:2px 6px;pointer-events:none";
    document.addEventListener("DOMContentLoaded", () =>
      document.body.append(title),
    );
    if (blockedStorage)
      Storage.prototype.setItem = function () {
        throw new DOMException("Test storage denied", "QuotaExceededError");
      };
  }, options);
}
