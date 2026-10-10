import { describe, expect, it, vi } from "vitest";
import {
  catalogExpirationTime,
  catalogUrls,
  getVisibleProducts,
  imageWindowExpired,
  isCatalogExpired,
  isOlderCatalogSnapshot,
  loadCatalog,
  METADATA_TTL_MS,
  TEMPORARY_IMAGE_WINDOW_MS,
} from "../catalog-source";
import type { CatalogSnapshot } from "../types";

const observedAt = "2026-10-08T12:00:00Z";
const observed = Date.parse(observedAt);
const photo =
  "https://d2iaagr1j041pi.cloudfront.net/apis/search_img.php?code=123";
const location = { hostname: "localhost", pathname: "/" };
const preview = {
  hostname: "raw.githack.com",
  pathname: `/chachazip-prog/kkokkapick/${"a".repeat(40)}/react-preview/`,
};
const snapshot = (extra: Partial<CatalogSnapshot> = {}): CatalogSnapshot => ({
  products: [
    { id: "source-id", name: "아기 우주복", imageUrl: photo, minPrice: 12000 },
  ],
  syncedAt: observedAt,
  storagePolicy: "ttl_cache",
  groupingVersion: 2,
  ...extra,
});
const json = (value: unknown) => new Response(JSON.stringify(value));

describe("catalog source compatibility and clock", () => {
  it("keeps nested web builds on the configured data path and immutable review sources live", () => {
    expect(catalogUrls(location, 123, "../data/").catalog).toBe(
      "../data/catalog.json?ts=123",
    );
    expect(catalogUrls(location, 123, "/data/").history).toBe(
      "/data/price-history.json?ts=123",
    );
    expect(catalogUrls(preview, 123).catalog).toBe(
      "https://raw.githubusercontent.com/chachazip-prog/kkokkapick/main/data/catalog.json?ts=123",
    );
    expect(catalogUrls(preview, 123).alternateCatalog).toContain(
      "/codex/release-ui-rebuild/data/catalog.json?ts=123",
    );
    expect(
      catalogUrls(
        { hostname: "raw.githack.com.evil.test", pathname: preview.pathname },
        123,
      ).catalog,
    ).toBe("./data/catalog.json?ts=123");
  });

  it("enforces the original image ceiling at the exact boundary, without renewing it", () => {
    const catalog = snapshot({
      expiresAt: new Date(observed + METADATA_TTL_MS).toISOString(),
    });
    expect(
      isCatalogExpired(catalog, observed + TEMPORARY_IMAGE_WINDOW_MS - 1),
    ).toBe(false);
    expect(
      isCatalogExpired(catalog, observed + TEMPORARY_IMAGE_WINDOW_MS),
    ).toBe(true);
    expect(catalogExpirationTime(catalog)).toBe(
      observed + TEMPORARY_IMAGE_WINDOW_MS,
    );
    expect(
      catalogExpirationTime(
        snapshot({ expiresAt: new Date(observed + 30 * 60000).toISOString() }),
      ),
    ).toBe(observed + 30 * 60000);
    expect(isCatalogExpired(snapshot({ syncedAt: "invalid" }), observed)).toBe(
      true,
    );
    expect(
      imageWindowExpired(
        snapshot({ syncedAt: new Date(observed + 300001).toISOString() }),
        observed,
      ),
    ).toBe(true);
    expect(catalog.syncedAt).toBe(observedAt);
  });

  it("honors explicit/legacy metadata expiry and keeps ordinary photos independent of the temporary ceiling", () => {
    const ordinary = snapshot({
      products: [{ imageUrl: "https://shop.example/photo.jpg" }],
    });
    expect(
      isCatalogExpired(ordinary, observed + TEMPORARY_IMAGE_WINDOW_MS),
    ).toBe(false);
    expect(isCatalogExpired(ordinary, observed + METADATA_TTL_MS)).toBe(true);
    expect(catalogExpirationTime(ordinary)).toBe(observed + METADATA_TTL_MS);
    expect(isCatalogExpired(snapshot({ expiresAt: "invalid" }), observed)).toBe(
      true,
    );
    expect(catalogExpirationTime(snapshot({ expiresAt: "invalid" }))).toBe(0);
    expect(isCatalogExpired(snapshot({ syncedAt: undefined }), observed)).toBe(
      true,
    );
  });

  it("chooses the freshest eligible preview grouping and its matching price history", async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(
      async (url: RequestInfo | URL, _init?: RequestInit) => {
        const path = String(url);
        calls.push(path);
        if (path.includes("price-history"))
          return json({
            events: [
              {
                productId: "source-id",
                observedAt,
                previousPrice: 15000,
                price: 12000,
                direction: "down",
                changeAmount: -3000,
              },
            ],
          });
        return json(
          snapshot({
            groupingVersion: path.includes("/codex/") ? 2 : 1,
            syncedAt: path.includes("/codex/")
              ? observedAt
              : new Date(observed + 5 * 60000).toISOString(),
          }),
        );
      },
    );
    const result = await loadCatalog(undefined, {
      fetchImpl,
      location: preview,
      now: observed + 10 * 60000,
    });
    expect(result.status).toBe("ready");
    expect(result.catalog?.syncedAt).toBe(observedAt);
    expect(result.history[0]?.changeAmount).toBe(-3000);
    expect(calls).toHaveLength(3);
    expect(calls[2]).toContain(
      "/codex/release-ui-rebuild/data/price-history.json",
    );
    for (const [, init] of fetchImpl.mock.calls)
      expect(init).toMatchObject({ cache: "no-store" });
  });

  it("preserves fallback when review fails but never displays expired products or fetches their history", async () => {
    const fetchImpl = vi.fn(async (url: RequestInfo | URL) =>
      String(url).includes("/codex/")
        ? new Response("", { status: 503 })
        : json(snapshot()),
    );
    const result = await loadCatalog(undefined, {
      fetchImpl,
      location: preview,
      now: observed + TEMPORARY_IMAGE_WINDOW_MS,
    });
    expect(result.status).toBe("expired");
    expect(result.products).toEqual([]);
    expect(result.history).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(
      getVisibleProducts(snapshot(), observed + TEMPORARY_IMAGE_WINDOW_MS),
    ).toEqual([]);
    expect(
      await loadCatalog(undefined, {
        fetchImpl: async () => new Response("", { status: 503 }),
        location,
        now: observed,
      }),
    ).toMatchObject({ status: "unavailable", products: [], history: [] });
  });

  it("keeps a fresh catalog when optional history fails and rechecks expiry after an in-flight history read", async () => {
    const fresh = await loadCatalog(undefined, {
      fetchImpl: async (url) =>
        String(url).includes("price-history")
          ? new Response("", { status: 503 })
          : json(snapshot()),
      location,
      now: observed + 60000,
    });
    expect(fresh.status).toBe("ready");
    expect(fresh.history).toEqual([]);
    let clock = observed + TEMPORARY_IMAGE_WINDOW_MS - 1;
    const expired = await loadCatalog(undefined, {
      fetchImpl: async (url) => {
        if (String(url).includes("price-history")) clock++;
        return json(
          String(url).includes("price-history") ? { events: [] } : snapshot(),
        );
      },
      location,
      now: () => clock,
    });
    expect(expired.status).toBe("expired");
    expect(expired.products).toEqual([]);
  });

  it("propagates caller cancellation and aborts the actual read signal", async () => {
    const controller = new AbortController();
    const fetchImpl = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("aborted", "AbortError")),
            { once: true },
          );
        }),
    );
    const pending = loadCatalog(controller.signal, {
      fetchImpl,
      location,
      now: observed,
    });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchImpl.mock.calls[0][1]?.signal?.aborted).toBe(true);
    await expect(
      loadCatalog(controller.signal, { fetchImpl, location }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("omits published fabric/floor coverings and missing HTTPS photos without changing source rows", () => {
    const products = [
      {
        id: "fabric",
        name: "아기 원피스 제작용 면 원단 1미터 가격",
        imageUrl: photo,
      },
      {
        id: "floor",
        name: "유아 놀이 매트 퍼즐",
        domain: "learning",
        imageUrl: photo,
      },
      {
        id: "missing",
        name: "아기 옷",
        imageUrl: "http://shop.example/photo.jpg",
      },
      {
        id: "valid",
        name: "IL GUFO KIDS 테크원단 남아 상하복 세트",
        category: "상하복",
        imageUrl: photo,
        checkedAt: observedAt,
      },
    ];
    const source = snapshot({ products }),
      before = JSON.stringify(source);
    expect(
      getVisibleProducts(source, observed + 60000).map((product) => product.id),
    ).toEqual(["valid"]);
    expect(JSON.stringify(source)).toBe(before);
    expect(
      isOlderCatalogSnapshot(
        snapshot({ syncedAt: "2026-10-08T11:00:00Z" }),
        source,
      ),
    ).toBe(true);
  });
});
