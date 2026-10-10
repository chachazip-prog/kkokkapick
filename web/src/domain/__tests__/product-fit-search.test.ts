import { describe, expect, it } from "vitest";
import {
  availableSizeFact,
  cleanProductName,
  materialFact,
  normalizeProductDisplayName,
  safeDestination,
  toClientProduct,
} from "../client-product";
import { getVisibleProducts } from "../catalog-source";
import { evaluateFit } from "../fit";
import {
  ageEvidence,
  isLengthPricedFabric,
  matchesMonths,
} from "../product-domain";
import { queryProducts } from "../search";
import { isTargetPriceReached, latestPriceChange } from "../price";
import type { DiscoveryProduct, PriceChange } from "../types";

const photo = "https://shop.example/one.jpg";
const products = (rows: Record<string, unknown>[]): DiscoveryProduct[] =>
  getVisibleProducts({ products: rows });

describe("client fact and fit compatibility", () => {
  it("keeps source identity and provenance while removing merchant clutter for display only", () => {
    const raw = {
      id: 123,
      name: "[보리보리][롯데백화점] 아가방 아양우주복 (모자) ABC12345678",
      brand: "아가방",
      imageUrl: photo,
      checkedAt: "2026-10-08T12:00:00Z",
      offers: [
        {
          price: "12000",
          originalPrice: "15000",
          merchant: "판매처",
          affiliateUrl: "https://shop.example/buy",
          checkedAt: "2026-10-08T12:00:00Z",
          productFactFields: { material: "composition" },
        },
      ],
    };
    const before = JSON.stringify(raw),
      client = toClientProduct(raw);
    expect(client.id).toBe("123");
    expect(client.name).toBe(raw.name);
    expect(client.checkedAt).toBe(raw.checkedAt);
    expect(client.offers[0].productFactFields.material).toBe("composition");
    expect(normalizeProductDisplayName(raw.name)).toBe(
      "아가방 아양우주복 (모자) ABC12345678",
    );
    expect(cleanProductName(client)).toBe("아양 우주복 + 모자 세트");
    expect(client.minPrice).toBe(12000);
    expect(client.offers[0].originalPrice).toBe(15000);
    expect(JSON.stringify(raw)).toBe(before);
  });

  it("never turns composition/size title tokens or a chart into live product facts", () => {
    const unknown = toClientProduct({
      name: "면100% 아가방 우주복 80 90",
      fitStatus: "verified",
      sizeGuide: { kind: "brand_official", rows: [{ size: "90", height: 84 }] },
    });
    expect(materialFact(unknown)).toEqual({ status: "unknown", value: null });
    expect(availableSizeFact(unknown)).toEqual({
      status: "unknown",
      value: null,
    });
    expect(
      materialFact(
        toClientProduct({ material: "면 100%", materialConflict: true }),
      ),
    ).toEqual({ status: "conflicting", value: null });
    expect(
      availableSizeFact(toClientProduct({ availableSizes: ["80", "90"] })),
    ).toEqual({ status: "provided", value: "80, 90" });
    expect(toClientProduct({ fitStatus: "invented" }).fitStatus).toBe(
      "unverified",
    );
    expect(safeDestination("javascript:alert(1)")).toBeNull();
    expect(safeDestination("https://shop.example/buy")).toBe(
      "https://shop.example/buy",
    );
  });

  it("uses existing verified evidence only, including newborn web profiles and selected child measurements", () => {
    expect(
      evaluateFit(
        { months: "0", height: "50", weight: "4" },
        { brand: "아가방" },
      ),
    ).toMatchObject({
      status: "recommended",
      recommendedSize: "1M",
      source: "official_brand_size_guide",
    });
    expect(
      evaluateFit(
        { months: "12", height: "76", weight: "10" },
        { brand: "아가방", name: "사이즈 160" },
      ),
    ).toMatchObject({ status: "recommended", recommendedSize: "80" });
    expect(
      evaluateFit(
        { months: "36", height: "92", weight: "14" },
        { brand: "아가방" },
      ),
    ).toMatchObject({ status: "recommended", recommendedSize: "100" });
    expect(
      evaluateFit(
        { months: 8, height: 72, weight: 9 },
        { name: "ETTOI 에뜨와 바디수트" },
      ),
    ).toMatchObject({ status: "recommended", brand: "에뜨와" });
    expect(
      evaluateFit(
        { months: 12, height: 76, weight: 10 },
        { brand: "밍크뮤", name: "90 100" },
      ).status,
    ).toBe("insufficient_product_data");
    expect(
      evaluateFit({ months: 12, height: "", weight: 10 }, { brand: "아가방" })
        .status,
    ).toBe("profile_required");
    expect(
      evaluateFit(
        { months: Infinity, height: 76, weight: 10 },
        { brand: "아가방" },
      ).status,
    ).toBe("profile_required");
    expect(
      evaluateFit(
        { months: 12, height: 76, weight: 10 },
        { domain: "toy", brand: "아가방" },
      ).status,
    ).toBe("not_applicable");
  });

  it("preserves explicit non-apparel age evidence and exclusions", () => {
    const evidence = ageEvidence("유아 블록 3단 10개", {
      recommended_age: "3세 이상",
    });
    expect(evidence).toMatchObject({
      minMonths: 36,
      maxMonths: null,
      source: "provider",
      sourceField: "recommended_age",
    });
    expect(matchesMonths({ ageEvidence: evidence }, "")).toBe(false);
    expect(matchesMonths({ ageEvidence: evidence }, 36)).toBe(true);
    expect(ageEvidence("유아 블록 3단 10개")).toBeNull();
    expect(ageEvidence("아기 그림책 3세 이상 사용 금지")).toBeNull();
    expect(isLengthPricedFabric("키즈 셔츠 원단 야드당 가격")).toBe(true);
    expect(isLengthPricedFabric("아동 코트 테크원단")).toBe(false);
  });
});

describe("search, offers, and observed price changes", () => {
  const rows = products([
    {
      id: "a",
      name: "아가방 아기 우주복",
      brand: "아가방",
      category: "바디수트",
      stage: "유아",
      fitStatus: "verified",
      imageUrl: photo,
      offers: [
        {
          merchant: "A",
          price: 10000,
          availableSizes: ["80"],
          affiliateUrl: "https://shop.example/a",
        },
        {
          merchant: "B",
          price: 18000,
          availableSizes: ["90"],
          affiliateUrl: "https://shop.example/b",
        },
      ],
    },
    {
      id: "b",
      name: "에뜨와 키즈 티셔츠",
      brand: "에뜨와",
      category: "상의",
      stage: "키즈",
      fitStatus: "verified",
      imageUrl: photo,
      offers: [
        {
          merchant: "B",
          price: 16000,
          availableSizes: ["90"],
          affiliateUrl: "https://shop.example/c",
        },
      ],
    },
    {
      id: "c",
      name: "유아 그림책 3세 이상",
      domain: "learning",
      category: "그림책·보드북",
      imageUrl: photo,
      ageEvidence: ageEvidence("유아 그림책 3세 이상"),
      offers: [
        { merchant: "C", price: 5000, affiliateUrl: "https://shop.example/d" },
      ],
    },
  ]);

  it("requires every search token and retains toddler overlap and favorites across domains", () => {
    expect(
      queryProducts(rows, {
        domain: "apparel",
        query: "아가방 A",
        stage: "토들러",
      }).map((product) => product.id),
    ).toEqual(["a"]);
    expect(queryProducts(rows, { query: "아가방 nonexistent" })).toEqual([]);
    expect(
      queryProducts(rows, { domain: "apparel", stage: "토들러" }).map(
        (product) => product.id,
      ),
    ).toEqual(["a", "b"]);
    expect(
      queryProducts(rows, {
        favoritesOnly: true,
        favoriteIds: new Set(["c"]),
      }).map((product) => product.id),
    ).toEqual(["c"]);
    expect(
      queryProducts(rows, { domain: "play", stage: "아이월령", months: 12 }),
    ).toEqual([]);
    expect(
      queryProducts(rows, {
        domain: "play",
        stage: "아이월령",
        months: 36,
      }).map((product) => product.id),
    ).toEqual(["c"]);
  });

  it("requires size, seller, and price to be satisfied by the same offer and shows its price", () => {
    expect(queryProducts(rows, { seller: "A", size: "90" })).toEqual([]);
    expect(
      queryProducts(rows, { seller: "B", size: "90", max: 17000 }).map(
        (product) => product.id,
      ),
    ).toEqual(["b"]);
    const match = queryProducts(rows, {
      seller: "B",
      size: "90",
      min: 17000,
    })[0];
    expect(match).toMatchObject({
      id: "a",
      price: 18000,
      minPrice: 10000,
      browseOffer: { merchant: "B" },
    });
    expect(rows[0].price).toBe(10000);
  });

  it("uses deterministic recommendation ties and the latest valid observed price change only", () => {
    const ties = products([
      { id: "z", name: "아기 옷", imageUrl: photo, minPrice: 10000 },
      { id: "a", name: "아기 옷", imageUrl: photo, minPrice: 10000 },
    ]);
    expect(queryProducts(ties).map((product) => product.id)).toEqual([
      "a",
      "z",
    ]);
    const events: PriceChange[] = [
      {
        productId: "a",
        observedAt: "2026-10-08T10:00:00Z",
        previousPrice: 15000,
        price: 10000,
        direction: "down",
        changeAmount: -5000,
      },
      {
        productId: "a",
        observedAt: "2026-10-08T11:00:00Z",
        previousPrice: 10000,
        price: 12000,
        direction: "up",
        changeAmount: 2000,
      },
      {
        productId: "b",
        observedAt: "2026-10-08T10:00:00Z",
        previousPrice: 17000,
        price: 16000,
        direction: "down",
        changeAmount: -1000,
      },
    ];
    expect(latestPriceChange(events, "a")?.direction).toBe("up");
    expect(
      queryProducts(rows, { sort: "drop", priceHistory: events })[0].id,
    ).toBe("b");
    expect(isTargetPriceReached(null, 10000)).toBe(false);
    expect(isTargetPriceReached(10000, "")).toBe(false);
    expect(isTargetPriceReached(10000, 10000)).toBe(true);
  });
});
