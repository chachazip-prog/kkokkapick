import { afterEach, describe, expect, it, vi } from "vitest";
import {
  browserStorage,
  createShoppingStore,
  LOCAL_STORAGE_KEYS,
  readJson,
  writeJson,
} from "../local-storage";
import type { BrowserStorage } from "../local-storage";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const blocked = new Set<string>();
  const storage: BrowserStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem(key, value) {
      if (blocked.has(key)) throw new Error("quota");
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
  return { data, blocked, storage };
}

afterEach(() => vi.unstubAllGlobals());

describe("local shopping persistence", () => {
  it("loads the exact legacy keys and shapes without rewriting them", () => {
    const initial = {
      favs: '["a",42,"a"]',
      recentProducts: '["b","a"]',
      priceAlerts: '{"a":10000,"b":20000}',
    };
    const { storage, data } = memoryStorage(initial);
    const store = createShoppingStore(storage);
    expect(store.favorites()).toEqual(["a", "42"]);
    expect(store.recentProducts()).toEqual(["b", "a"]);
    expect(store.priceAlerts()).toEqual({ a: 10000, b: 20000 });
    expect(Object.fromEntries(data)).toEqual(initial);
    expect(LOCAL_STORAGE_KEYS).toEqual({
      childProfiles: "kkokkapickChildProfiles",
      months: "months",
      height: "height",
      weight: "weight",
      favorites: "favs",
      priceAlerts: "priceAlerts",
      recentProducts: "recentProducts",
    });
  });

  it.each(["{broken", "{}", "3", '"value"', "null"])(
    "recovers invalid ID collection %s without replacing saved data",
    (raw) => {
      const { storage, data } = memoryStorage({
        favs: raw,
        recentProducts: raw,
      });
      const store = createShoppingStore(storage);
      expect(store.favorites()).toEqual([]);
      expect(store.recentProducts()).toEqual([]);
      expect(data.get("favs")).toBe(raw);
      expect(data.get("recentProducts")).toBe(raw);
      expect(store.toggleFavorite("p")).toBe(true);
      expect(data.get("favs")).toBe('["p"]');
      expect(data.get("recentProducts")).toBe(raw);
    },
  );

  it.each(["{broken", "[]", "3", '"value"', "null"])(
    "recovers invalid alert collection %s on the next explicit write",
    (raw) => {
      const { storage, data } = memoryStorage({ priceAlerts: raw });
      const store = createShoppingStore(storage);
      expect(store.priceAlerts()).toEqual({});
      expect(data.get("priceAlerts")).toBe(raw);
      expect(store.setPriceAlert("p", "20000")).toBe(true);
      expect(JSON.parse(data.get("priceAlerts")!)).toEqual({ p: 20000 });
    },
  );

  it("ignores malformed alert values while retaining valid numeric records and saved bytes", () => {
    const raw =
      '{"p":15000,"null":null,"string":"20000","object":{},"rounded":0}';
    const { storage, data } = memoryStorage({ priceAlerts: raw });
    expect(createShoppingStore(storage).priceAlerts()).toEqual({
      p: 15000,
      rounded: 0,
    });
    expect(data.get("priceAlerts")).toBe(raw);
  });

  it("ignores unconvertible malformed IDs without losing usable legacy IDs", () => {
    const raw = '[{"toString":null,"valueOf":null},42,"p"]';
    const { storage, data } = memoryStorage({ favs: raw, recentProducts: raw });
    const store = createShoppingStore(storage);
    expect(store.favorites()).toEqual(["42", "p"]);
    expect(store.recentProducts()).toEqual(["42", "p"]);
    expect(data.get("favs")).toBe(raw);
    expect(data.get("recentProducts")).toBe(raw);
  });

  it.each([{ saved: [] as string[] }, { saved: ["p"] }])(
    "keeps saved and visible favorites unchanged when a write fails from %j",
    ({ saved }) => {
      const raw = JSON.stringify(saved);
      const { storage, data, blocked } = memoryStorage({ favs: raw });
      const store = createShoppingStore(storage);
      blocked.add("favs");
      expect(store.toggleFavorite("p")).toBe(false);
      expect(store.favorites()).toEqual(saved);
      expect(data.get("favs")).toBe(raw);
      blocked.delete("favs");
      expect(store.toggleFavorite("p")).toBe(true);
      expect(store.favorites()).toEqual(saved.length ? [] : ["p"]);
    },
  );

  it("commits alert updates and removals before replacing the visible record", () => {
    const raw = '{"p":15000,"other":25000}';
    const { storage, data, blocked } = memoryStorage({ priceAlerts: raw });
    const store = createShoppingStore(storage);
    blocked.add("priceAlerts");
    expect(store.setPriceAlert("p", 20000)).toBe(false);
    expect(store.removePriceAlert("p")).toBe(false);
    expect(store.priceAlerts()).toEqual({ p: 15000, other: 25000 });
    expect(data.get("priceAlerts")).toBe(raw);
    blocked.delete("priceAlerts");
    expect(store.setPriceAlert("p", 20000.6)).toBe(true);
    expect(store.priceAlerts().p).toBe(20001);
    expect(store.removePriceAlert("p")).toBe(true);
    expect(JSON.parse(data.get("priceAlerts")!)).toEqual({ other: 25000 });
  });

  it.each(["", 0, -1, null, undefined, "invalid", Infinity])(
    "preserves the legacy UI behavior of removing an alert for target %s",
    (target) => {
      const { storage, data } = memoryStorage({ priceAlerts: '{"p":15000}' });
      const store = createShoppingStore(storage);
      expect(store.setPriceAlert("p", target)).toBe(true);
      expect(store.priceAlerts()).toEqual({});
      expect(data.get("priceAlerts")).toBe("{}");
    },
  );

  it("preserves legacy rounding for positive fractional target prices", () => {
    const { storage } = memoryStorage();
    const store = createShoppingStore(storage);
    expect(store.setPriceAlert("p", 0.4)).toBe(true);
    expect(store.priceAlerts()).toEqual({ p: 0 });
  });

  it("moves a repeated recent product to the front and limits explicit visits to 20", () => {
    const ids = Array.from({ length: 25 }, (_, index) => String(index));
    const { storage, data } = memoryStorage({
      recentProducts: JSON.stringify(ids),
    });
    const store = createShoppingStore(storage);
    expect(store.recentProducts()).toHaveLength(25);
    expect(store.recordRecent(5)).toBe(true);
    expect(store.recentProducts()).toEqual(
      ["5", ...ids.filter((id) => id !== "5")].slice(0, 20),
    );
    expect(JSON.parse(data.get("recentProducts")!)).toEqual(
      store.recentProducts(),
    );
  });

  it("keeps recent history unchanged on quota failure and permits a later visit", () => {
    const { storage, data, blocked } = memoryStorage({
      recentProducts: '["other"]',
    });
    const store = createShoppingStore(storage);
    blocked.add("recentProducts");
    expect(store.recordRecent("p")).toBe(false);
    expect(store.recentProducts()).toEqual(["other"]);
    expect(data.get("recentProducts")).toBe('["other"]');
    blocked.delete("recentProducts");
    expect(store.recordRecent("p")).toBe(true);
    expect(store.recentProducts()).toEqual(["p", "other"]);
  });

  it("returns detached snapshots and handles special product IDs as own data keys", () => {
    const { storage } = memoryStorage({
      favs: '["p"]',
      recentProducts: '["p"]',
    });
    const store = createShoppingStore(storage);
    expect(store.setPriceAlert("__proto__", 10000)).toBe(true);
    store.favorites().push("changed");
    store.recentProducts().push("changed");
    store.priceAlerts().__proto__ = 5;
    expect(store.favorites()).toEqual(["p"]);
    expect(store.recentProducts()).toEqual(["p"]);
    expect(store.priceAlerts()).toEqual(JSON.parse('{"__proto__":10000}'));
    expect(store.removePriceAlert("__proto__")).toBe(true);
    expect(store.priceAlerts()).toEqual({});
  });

  it("tolerates denied browser property access and succeeds after storage is restored", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "localStorage",
    );
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new Error("storage denied");
      },
    });
    try {
      const store = createShoppingStore(browserStorage);
      expect(store.favorites()).toEqual([]);
      expect(store.priceAlerts()).toEqual({});
      expect(store.recentProducts()).toEqual([]);
      expect(store.toggleFavorite("p")).toBe(false);
      expect(store.setPriceAlert("p", 10000)).toBe(false);
      expect(store.recordRecent("p")).toBe(false);
      const { storage } = memoryStorage();
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: storage,
      });
      expect(store.toggleFavorite("p")).toBe(true);
      expect(storage.getItem("favs")).toBe('["p"]');
    } finally {
      if (descriptor)
        Object.defineProperty(globalThis, "localStorage", descriptor);
      else Reflect.deleteProperty(globalThis, "localStorage");
    }
  });
});

describe("JSON storage helpers", () => {
  it("returns a fallback on denied reads without attempting repairs", () => {
    const writes = vi.fn();
    const storage: BrowserStorage = {
      getItem() {
        throw new Error("denied");
      },
      setItem: writes,
      removeItem: writes,
    };
    expect(
      readJson(storage, "favs", [], (value): value is string[] =>
        Array.isArray(value),
      ),
    ).toEqual([]);
    expect(writes).not.toHaveBeenCalled();
  });

  it("reports serialization failure without changing saved data", () => {
    const { storage, data } = memoryStorage({ favs: '["p"]' });
    const circular: { self?: unknown } = {};
    circular.self = circular;
    expect(writeJson(storage, "favs", circular)).toBe(false);
    expect(writeJson(storage, "favs", undefined)).toBe(false);
    expect(data.get("favs")).toBe('["p"]');
  });
});
