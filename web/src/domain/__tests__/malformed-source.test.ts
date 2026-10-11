import { describe, expect, it } from "vitest";
import {
  catalogExpirationTime,
  getVisibleProducts,
  isCatalogExpired,
  loadCatalog,
  parsePriceHistory,
  toClientProduct,
} from "../index";

describe("malformed upstream JSON fails safely without inventing facts", () => {
  it("discards malformed age provenance and only invalid history rows", () => {
    expect(
      toClientProduct({
        ageEvidence: {
          minMonths: 0,
          maxMonths: 12,
          source: { toString: null },
          sourceField: "recommended_age",
          rawText: "bad",
        },
      }).ageEvidence,
    ).toBeNull();
    const valid = {
      productId: "healthy",
      observedAt: "2026-10-10T05:00:00Z",
      previousPrice: 10000,
      price: 8000,
      direction: "down",
      changeAmount: -2000,
    };
    expect(
      parsePriceHistory({
        events: [{ ...valid, previousPrice: { toString: null } }, valid],
      }),
    ).toEqual([valid]);
  });
  it("preserves healthy rows and discards a malformed title without blocking the catalog", () => {
    const source = {
      products: [
        {
          id: "bad",
          name: { toString: {} },
          imageUrl: "https://shop.example/bad.jpg",
        },
        {
          id: "good",
          name: "아기 우주복",
          imageUrl: "https://shop.example/good.jpg",
          offers: [
            {
              affiliateUrl: "https://shop.example/buy",
              price: { toString: {} },
              availableSizes: ["80", { toString: {} }],
            },
          ],
        },
      ],
    };
    expect(getVisibleProducts(source).map((product) => product.id)).toEqual([
      "good",
    ]);
    expect(toClientProduct(source.products[1])).toMatchObject({
      minPrice: null,
      offers: [{ price: null, availableSizes: ["80"] }],
    });
  });
  it.each([
    { minMonths: -1, maxMonths: null },
    { minMonths: 12, maxMonths: 6 },
    { minMonths: 6, maxMonths: 217 },
  ])("does not recommend malformed age bounds %j", (bounds) => {
    expect(
      toClientProduct({
        ageEvidence: {
          ...bounds,
          source: "provider",
          sourceField: "recommended_age",
          rawText: "malformed",
        },
      }).ageEvidence,
    ).toBeNull();
  });
  it("explicit empty expiry is expired rather than an omitted clock", () => {
    const source = { products: [], expiresAt: "" };
    expect(isCatalogExpired(source)).toBe(true);
    expect(catalogExpirationTime(source)).toBe(0);
  });
  it("rejects malformed clock JSON with an unavailable state", async () => {
    const state = await loadCatalog(undefined, {
      location: { hostname: "localhost" },
      fetchImpl: async () =>
        new Response(
          JSON.stringify({ products: [], syncedAt: { toString: {} } }),
        ),
    });
    expect(state.status).toBe("unavailable");
  });
});
