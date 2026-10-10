import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCatalog } from "./use-catalog";
import * as domain from "@/domain";
import {
  CATALOG_REFRESH_INTERVAL_MS,
  TEMPORARY_IMAGE_WINDOW_MS,
} from "@/domain";

const observedAt = "2026-10-08T12:00:00Z";
const observed = Date.parse(observedAt);
const photo =
  "https://d2iaagr1j041pi.cloudfront.net/apis/search_img.php?code=123";
const other = "https://shop.example/two.jpg";
const snapshot = {
  products: [
    {
      id: "p",
      name: "아기 우주복",
      imageUrl: photo,
      imageUrls: [other],
      minPrice: 12000,
    },
  ],
  storagePolicy: "ttl_cache",
  syncedAt: observedAt,
};

function publishedFetch() {
  const fetchImpl = vi.fn(
    async (url: RequestInfo | URL) =>
      new Response(
        JSON.stringify(
          String(url).includes("price-history") ? { events: [] } : snapshot,
        ),
      ),
  );
  vi.stubGlobal("fetch", fetchImpl);
  return fetchImpl;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(observed + 60000);
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("catalog hook source clock and photo failures", () => {
  it("renders an unavailable state rather than loading forever on an unexpected loader error", async () => {
    vi.spyOn(domain, "loadCatalog").mockRejectedValueOnce(
      new Error("Controlled unexpected source error"),
    );
    const { result } = renderHook(useCatalog);
    await act(async () => {});
    expect(result.current.state).toMatchObject({
      status: "unavailable",
      catalog: null,
      products: [],
    });
    expect(result.current.refreshing).toBe(false);
  });
  it("removes open product data at the original deadline without a refresh or source clock renewal", async () => {
    vi.spyOn(window, "setInterval").mockReturnValue(
      0 as unknown as ReturnType<typeof window.setInterval>,
    );
    const fetchImpl = publishedFetch();
    const { result } = renderHook(useCatalog);
    await act(async () => {});
    expect(result.current.state?.status).toBe("ready");
    expect(result.current.state?.catalog?.syncedAt).toBe(observedAt);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TEMPORARY_IMAGE_WINDOW_MS - 60000 - 1);
    });
    expect(result.current.state?.products).toHaveLength(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(result.current.state).toMatchObject({
      status: "expired",
      products: [],
      history: [],
    });
    expect(result.current.state?.catalog?.syncedAt).toBe(observedAt);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("preserves an unexpired source when JSON refresh fails, then expires it on visibility", async () => {
    const fetchImpl = publishedFetch();
    const { result } = renderHook(useCatalog);
    await act(async () => {});
    fetchImpl.mockImplementation(async () => new Response("", { status: 503 }));
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.refreshFailed).toBe(true);
    expect(result.current.state?.status).toBe("ready");
    expect(result.current.state?.expiresAt).toBe(
      observed + TEMPORARY_IMAGE_WINDOW_MS,
    );
    vi.setSystemTime(observed + TEMPORARY_IMAGE_WINDOW_MS);
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current.state?.products).toEqual([]);
    expect(result.current.state?.history).toEqual([]);
  });

  it("keeps background JSON refresh visible-only and bounded to the existing five-minute interval", async () => {
    const fetchImpl = publishedFetch();
    const { result } = renderHook(useCatalog);
    await act(async () => {});
    for (let index = 0; index < 3; index++) {
      await act(async () => {
        window.dispatchEvent(new Event("online"));
        document.dispatchEvent(new Event("visibilitychange"));
      });
    }
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(CATALOG_REFRESH_INTERVAL_MS);
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(fetchImpl).toHaveBeenCalledTimes(4);
    expect(result.current.state?.status).toBe("ready");
  });

  it("quarantines a failed rendered reload and keeps alternate original photos available", async () => {
    publishedFetch();
    const { result } = renderHook(useCatalog);
    await act(async () => {});
    const images = result.current.images,
      generation = images.generation();
    const recover = vi.spyOn(images, "recover").mockResolvedValue("available");
    await act(async () => {
      expect(await result.current.recoverPhoto(photo, generation)).toBe(
        "available",
      );
    });
    await act(async () => {
      expect(await result.current.recoverPhoto(photo, generation, true)).toBe(
        "unavailable",
      );
    });
    expect(recover).toHaveBeenCalledTimes(1);
    expect(images.urls(snapshot.products[0])).toEqual([other]);
    expect(result.current.state?.products).toHaveLength(1);
    await act(async () => {
      await result.current.recoverPhoto(other, generation, true);
    });
    expect(result.current.state?.products).toEqual([]);
    expect(result.current.state?.catalog?.syncedAt).toBe(observedAt);
  });

  it("does not quarantine an offline reload or a refreshed photo's obsolete generation", async () => {
    publishedFetch();
    const { result } = renderHook(useCatalog);
    await act(async () => {});
    const generation = result.current.images.generation();
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    await act(async () => {
      expect(await result.current.recoverPhoto(photo, generation, true)).toBe(
        "offline",
      );
    });
    expect(result.current.images.failedCount()).toBe(0);
    result.current.images.setSnapshot("2026-10-08T12:00:30Z", observed + 60000);
    await act(async () => {
      expect(await result.current.recoverPhoto(photo, generation, true)).toBe(
        "stale",
      );
    });
    expect(result.current.images.failedCount()).toBe(0);
    expect(result.current.state?.products).toHaveLength(1);
  });
});
