import { toClientProduct } from "./client-product";
import { categoryOf, isDiscoveryProduct } from "./product-domain";
import { createImageAvailabilityState } from "./image-availability";
import type { ImageAvailabilityState } from "./image-availability";
import { parsePriceHistory } from "./price";
import { isRecord } from "./types";
import type { CatalogSnapshot, DiscoveryProduct, PriceChange } from "./types";

export const TEMPORARY_IMAGE_WINDOW_MS = 90 * 60 * 1000;
export const METADATA_TTL_MS = 24 * 60 * 60 * 1000;
export const CATALOG_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const LIVE_BASE =
  "https://raw.githubusercontent.com/chachazip-prog/kkokkapick/main/data/";

export interface CatalogLocation {
  hostname?: string;
  pathname?: string;
}
export interface CatalogUrls {
  catalog: string;
  history: string;
  alternateCatalog?: string;
  alternateHistory?: string;
}
export interface CatalogLoadOptions {
  fetchImpl?: typeof fetch;
  location?: CatalogLocation;
  /** Runtime chooses '../data/' for nested react-preview/, '/data/' in Vite. */
  baseUrl?: string;
  now?: number | (() => number);
  imageState?: ImageAvailabilityState;
}

export type CatalogState =
  | {
      status: "ready";
      catalog: CatalogSnapshot;
      products: DiscoveryProduct[];
      history: PriceChange[];
      expiresAt: number | null;
      loadedAt: number;
      error: null;
    }
  | {
      status: "expired";
      catalog: CatalogSnapshot;
      products: [];
      history: [];
      expiresAt: number | null;
      loadedAt: number;
      error: null;
    }
  | {
      status: "unavailable";
      catalog: null;
      products: [];
      history: [];
      expiresAt: null;
      loadedAt: number;
      error: "catalog_unavailable";
    };

export function isSnapshotPreview(location: CatalogLocation): boolean {
  return (
    location.hostname === "raw.githack.com" &&
    /^\/chachazip-prog\/kkokkapick\/[0-9a-f]{40}\//i.test(
      location.pathname || "",
    )
  );
}

export function catalogUrls(
  location: CatalogLocation,
  now = Date.now(),
  baseUrl = "./data/",
): CatalogUrls {
  const preview = isSnapshotPreview(location);
  const base = preview
    ? LIVE_BASE
    : baseUrl.endsWith("/")
      ? baseUrl
      : baseUrl + "/";
  const result: CatalogUrls = {
    catalog: base + "catalog.json?ts=" + now,
    history: base + "price-history.json?ts=" + now,
  };
  if (preview) {
    const review = LIVE_BASE.replace("/main/", "/codex/release-ui-rebuild/");
    result.alternateCatalog = review + "catalog.json?ts=" + now;
    result.alternateHistory = review + "price-history.json?ts=" + now;
  }
  return result;
}

function hasTemporaryImages(
  catalog: CatalogSnapshot | null | undefined,
): boolean {
  return (catalog?.products || []).some((product) =>
    [
      product.imageUrl,
      ...(Array.isArray(product.imageUrls) ? product.imageUrls : []),
    ].some((value) => {
      if (typeof value !== "string") return false;
      try {
        const url = new URL(value);
        return (
          url.hostname === "d2iaagr1j041pi.cloudfront.net" &&
          url.pathname === "/apis/search_img.php"
        );
      } catch {
        return false;
      }
    }),
  );
}

export function imageWindowExpired(
  catalog: CatalogSnapshot | null | undefined,
  now = Date.now(),
): boolean {
  if (!hasTemporaryImages(catalog)) return false;
  const observed = Date.parse(catalog?.syncedAt || "");
  return (
    !Number.isFinite(observed) ||
    observed > now + 300000 ||
    now >= observed + TEMPORARY_IMAGE_WINDOW_MS
  );
}

export function catalogExpirationTime(
  catalog: CatalogSnapshot | null | undefined,
): number | null {
  if (!catalog) return null;
  const deadlines: number[] = [],
    observed = Date.parse(catalog.syncedAt || "");
  if (hasTemporaryImages(catalog))
    deadlines.push(
      Number.isFinite(observed) ? observed + TEMPORARY_IMAGE_WINDOW_MS : 0,
    );
  if (catalog.expiresAt !== undefined) {
    const stamp = Date.parse(catalog.expiresAt);
    deadlines.push(Number.isFinite(stamp) ? stamp : 0);
  } else if (catalog.storagePolicy === "ttl_cache")
    deadlines.push(Number.isFinite(observed) ? observed + METADATA_TTL_MS : 0);
  return deadlines.length ? Math.min(...deadlines) : null;
}

export function isCatalogExpired(
  catalog: CatalogSnapshot | null | undefined,
  now = Date.now(),
): boolean {
  if (!catalog) return true;
  if (imageWindowExpired(catalog, now)) return true;
  if (catalog.expiresAt !== undefined) {
    const stamp = Date.parse(catalog.expiresAt);
    return !Number.isFinite(stamp) || now >= stamp;
  }
  if (catalog.storagePolicy === "ttl_cache") {
    const stamp = Date.parse(catalog.syncedAt || "");
    return !Number.isFinite(stamp) || now >= stamp + METADATA_TTL_MS;
  }
  return false;
}

/** Pure source clock comparison: neither fetch completion nor photo decode replaces syncedAt. */
export function isOlderCatalogSnapshot(
  candidate: CatalogSnapshot,
  current: CatalogSnapshot | null,
): boolean {
  return (
    !!current &&
    Date.parse(candidate.syncedAt || "") < Date.parse(current.syncedAt || "")
  );
}

export function getVisibleProducts(
  catalog: CatalogSnapshot,
  now = Date.now(),
  imageState?: ImageAvailabilityState,
): DiscoveryProduct[] {
  if (isCatalogExpired(catalog, now)) return [];
  const images = imageState || createImageAvailabilityState();
  images.setSnapshot(catalog.syncedAt, now);
  return catalog.products.flatMap((raw, index) => {
    try {
      if (!isDiscoveryProduct(raw) || !images.urls(raw).length) return [];
      const product = toClientProduct(raw);
      return [
        {
          ...product,
          id: product.id || String(index),
          price: product.minPrice,
          merchant: product.offers[0]?.merchant || "",
          cat:
            typeof raw.category === "string" && raw.category
              ? raw.category
              : categoryOf(raw),
          stage: product.stage || "전체",
        },
      ];
    } catch {
      return [];
    }
  });
}

function abortError(): DOMException {
  return new DOMException("Catalog request aborted", "AbortError");
}

/** Reads only published JSON; no provider API, persistence, analytics, or photo storage. */
export async function loadCatalog(
  signal?: AbortSignal,
  options: CatalogLoadOptions = {},
): Promise<CatalogState> {
  const fetchImpl = options.fetchImpl || fetch;
  const location =
    options.location || (typeof window !== "undefined" ? window.location : {});
  const providedNow = options.now;
  const clock =
    typeof providedNow === "function"
      ? providedNow
      : () => providedNow ?? Date.now();
  const startedAt = clock();
  if (signal?.aborted) throw abortError();
  const paths = catalogUrls(location, startedAt, options.baseUrl);
  async function read(url: string): Promise<unknown> {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) controller.abort();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchImpl(url, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Catalog source unavailable");
      return await response.json();
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbort);
    }
  }
  const sources = [{ catalog: paths.catalog, history: paths.history }];
  if (paths.alternateCatalog && paths.alternateHistory)
    sources.push({
      catalog: paths.alternateCatalog,
      history: paths.alternateHistory,
    });
  const candidates = (
    await Promise.all(
      sources.map(async (source) => {
        try {
          const raw = await read(source.catalog);
          if (
            !isRecord(raw) ||
            !Array.isArray(raw.products) ||
            (isSnapshotPreview(location) && raw.groupingVersion !== 2) ||
            (raw.syncedAt !== undefined && typeof raw.syncedAt !== "string") ||
            (raw.expiresAt !== undefined && typeof raw.expiresAt !== "string")
          )
            return null;
          const catalog = {
            ...raw,
            products: raw.products.filter(isRecord),
          } as CatalogSnapshot;
          return { catalog, source };
        } catch {
          return null;
        }
      }),
    )
  ).filter(
    (candidate): candidate is NonNullable<typeof candidate> =>
      candidate !== null,
  );
  if (signal?.aborted) throw abortError();
  const now = clock();
  if (!candidates.length)
    return {
      status: "unavailable",
      catalog: null,
      products: [],
      history: [],
      expiresAt: null,
      loadedAt: now,
      error: "catalog_unavailable",
    };
  const valid = candidates.filter(
    (candidate) => !isCatalogExpired(candidate.catalog, now),
  );
  const chosen = (valid.length ? valid : candidates).sort(
    (a, b) =>
      (Date.parse(b.catalog.syncedAt || "") || 0) -
      (Date.parse(a.catalog.syncedAt || "") || 0),
  )[0];
  if (isCatalogExpired(chosen.catalog, now))
    return {
      status: "expired",
      catalog: chosen.catalog,
      products: [],
      history: [],
      expiresAt: catalogExpirationTime(chosen.catalog),
      loadedAt: now,
      error: null,
    };
  let history: PriceChange[] = [];
  try {
    history = parsePriceHistory(await read(chosen.source.history));
  } catch {
    /* History is optional and cannot block the fresh catalog. */
  }
  if (signal?.aborted) throw abortError();
  const loadedAt = clock();
  if (isCatalogExpired(chosen.catalog, loadedAt))
    return {
      status: "expired",
      catalog: chosen.catalog,
      products: [],
      history: [],
      expiresAt: catalogExpirationTime(chosen.catalog),
      loadedAt,
      error: null,
    };
  return {
    status: "ready",
    catalog: chosen.catalog,
    products: getVisibleProducts(chosen.catalog, loadedAt, options.imageState),
    history,
    expiresAt: catalogExpirationTime(chosen.catalog),
    loadedAt,
    error: null,
  };
}
