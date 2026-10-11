/** Local browser persistence only. These records are never sent to an account or API. */
export interface BrowserStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const LOCAL_STORAGE_KEYS = {
  childProfiles: "kkokkapickChildProfiles",
  months: "months",
  height: "height",
  weight: "weight",
  favorites: "favs",
  priceAlerts: "priceAlerts",
  recentProducts: "recentProducts",
} as const;

// Resolve storage inside each operation. Merely accessing the browser property
// can throw when storage is disabled; importing this module must remain safe.
export const browserStorage: BrowserStorage = {
  getItem: (key) => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
  removeItem: (key) => globalThis.localStorage.removeItem(key),
};

export function readRaw(storage: BrowserStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/** Invalid or inaccessible records are left untouched until an explicit write. */
export function readJson<T>(
  storage: BrowserStorage,
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  try {
    const value: unknown = JSON.parse(readRaw(storage, key) ?? "null");
    return isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

/** A caller changes visible state only after this returns true. */
export function writeJson(
  storage: BrowserStorage,
  key: string,
  value: unknown,
): boolean {
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) return false;
    storage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

export type ProductId = string | number;
export type PriceAlerts = Record<string, number>;
export type TargetPriceInput = string | number | null | undefined;

export interface ShoppingStore {
  favorites(): string[];
  priceAlerts(): PriceAlerts;
  recentProducts(): string[];
  toggleFavorite(id: ProductId): boolean;
  setPriceAlert(id: ProductId, target: TargetPriceInput): boolean;
  removePriceAlert(id: ProductId): boolean;
  recordRecent(id: ProductId): boolean;
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readIds(storage: BrowserStorage, key: string): string[] {
  // The existing favorite store coerces IDs with String, including numeric IDs.
  const ids: string[] = [];
  for (const value of readJson<unknown[]>(storage, key, [], isArray)) {
    try {
      ids.push(String(value));
    } catch {
      // A malformed JSON object can override its own conversion methods.
    }
  }
  return ids;
}

function readPriceAlerts(storage: BrowserStorage): PriceAlerts {
  const saved = readJson<Record<string, unknown>>(
    storage,
    LOCAL_STORAGE_KEYS.priceAlerts,
    {},
    isObject,
  );
  return Object.fromEntries(
    Object.entries(saved).filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === "number" && Number.isFinite(entry[1]),
    ),
  );
}

/** All mutations commit to the legacy key before replacing the in-memory value. */
export function createShoppingStore(
  storage: BrowserStorage = browserStorage,
): ShoppingStore {
  let favorites = new Set(readIds(storage, LOCAL_STORAGE_KEYS.favorites));
  let alerts = readPriceAlerts(storage);
  let recent = readIds(storage, LOCAL_STORAGE_KEYS.recentProducts);

  return {
    favorites: () => [...favorites],
    priceAlerts: () => ({ ...alerts }),
    recentProducts: () => [...recent],

    toggleFavorite(id) {
      const key = String(id);
      const next = new Set(favorites);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      if (!writeJson(storage, LOCAL_STORAGE_KEYS.favorites, [...next]))
        return false;
      favorites = next;
      return true;
    },

    setPriceAlert(id, target) {
      const key = String(id);
      const value = Number(target);
      const next = { ...alerts };
      if (value > 0 && Number.isFinite(value)) {
        // defineProperty also handles a product ID equal to "__proto__" as data.
        Object.defineProperty(next, key, {
          value: Math.round(value),
          enumerable: true,
          configurable: true,
          writable: true,
        });
      } else {
        delete next[key];
      }
      if (!writeJson(storage, LOCAL_STORAGE_KEYS.priceAlerts, next))
        return false;
      alerts = next;
      return true;
    },

    removePriceAlert(id) {
      const next = { ...alerts };
      delete next[String(id)];
      if (!writeJson(storage, LOCAL_STORAGE_KEYS.priceAlerts, next))
        return false;
      alerts = next;
      return true;
    },

    recordRecent(id) {
      const key = String(id);
      const next = [key, ...recent.filter((value) => value !== key)].slice(
        0,
        20,
      );
      if (!writeJson(storage, LOCAL_STORAGE_KEYS.recentProducts, next))
        return false;
      recent = next;
      return true;
    },
  };
}
