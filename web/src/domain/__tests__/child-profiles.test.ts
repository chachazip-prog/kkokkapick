import { describe, expect, it, vi } from "vitest";
import { createChildProfileStore } from "../child-profiles";
import type { ChildProfileInput } from "../child-profiles";
import { browserStorage } from "../local-storage";
import type { BrowserStorage } from "../local-storage";

const primaryKey = "kkokkapickChildProfiles";
const newborn: ChildProfileInput = { months: "0", height: "50", weight: "4" };

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const blocked = new Set<string>();
  const removed = new Set<string>();
  const storage: BrowserStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem(key, value) {
      if (blocked.has(key)) throw new Error("quota");
      data.set(key, value);
    },
    removeItem(key) {
      if (blocked.has(key)) throw new Error("quota");
      removed.add(key);
      data.delete(key);
    },
  };
  return { storage, data, blocked, removed };
}

describe("local child profiles", () => {
  it("migrates legacy zero-month measurements without writing until an explicit mutation", () => {
    const initial = { months: "0", height: "50", weight: "4" };
    const { storage, data } = memoryStorage(initial);
    const store = createChildProfileStore(storage);
    expect(store.current()).toEqual({
      id: "child-legacy",
      name: "우리 아이",
      ...initial,
    });
    expect(Object.fromEntries(data)).toEqual(initial);
    const second = store.save({
      name: "둘째",
      months: "36",
      height: "92",
      weight: "14",
    });
    expect(store.all()).toHaveLength(2);
    expect(store.current()).toEqual(second);
    expect(JSON.parse(data.get(primaryKey)!)).toEqual({
      version: 1,
      selectedId: second.id,
      children: store.all(),
    });
    expect(createChildProfileStore(storage).current()?.name).toBe("둘째");
    expect(store.select("child-legacy")).toBe(true);
    expect(store.current()?.months).toBe("0");
    expect(storage.getItem("months")).toBe("0");
  });

  it("does not resurrect deleted profiles from stale compatibility mirrors", () => {
    const { storage } = memoryStorage({
      [primaryKey]: '{"version":1,"selectedId":null,"children":[]}',
      months: "12",
      height: "76",
      weight: "10",
    });
    const store = createChildProfileStore(storage);
    expect(store.all()).toEqual([]);
    expect(store.current()).toBeNull();
  });

  it("recovers malformed primary JSON through legacy mirrors without altering saved bytes", () => {
    const { storage, data } = memoryStorage({
      [primaryKey]: "{broken",
      months: "0",
    });
    const store = createChildProfileStore(storage);
    expect(store.current()).toEqual({
      id: "child-legacy",
      name: "우리 아이",
      months: "0",
      height: "",
      weight: "",
    });
    expect(data.get(primaryKey)).toBe("{broken");
  });

  it("sanitizes duplicate IDs and measurements and falls back to the first valid selection", () => {
    const raw = JSON.stringify({
      selectedId: "missing",
      children: [
        null,
        { id: "" },
        { id: "x".repeat(101) },
        { id: "same", name: "<img>", ...newborn },
        { id: "same", months: "12" },
        {
          id: "other",
          name: "x".repeat(25),
          months: "-1",
          height: "Infinity",
          weight: "bad",
        },
      ],
    });
    const { storage, data } = memoryStorage({ [primaryKey]: raw });
    const store = createChildProfileStore(storage);
    expect(store.all()).toEqual([
      { id: "same", name: "<img>", ...newborn },
      { id: "other", name: "x".repeat(20), months: "", height: "", weight: "" },
    ]);
    expect(store.current()?.id).toBe("same");
    expect(data.get(primaryKey)).toBe(raw);
  });

  it("recovers malformed conversion methods in saved profile fields", () => {
    const invalid = { toString: null, valueOf: null };
    const raw = JSON.stringify({
      selectedId: "p",
      children: [
        {
          id: "p",
          name: invalid,
          months: invalid,
          height: invalid,
          weight: invalid,
        },
      ],
    });
    const { storage, data } = memoryStorage({ [primaryKey]: raw });
    expect(createChildProfileStore(storage).current()).toEqual({
      id: "p",
      name: "우리 아이",
      months: "",
      height: "",
      weight: "",
    });
    expect(data.get(primaryKey)).toBe(raw);
  });

  it("restores a valid saved selection and updates the existing profile without appending", () => {
    const { storage } = memoryStorage();
    const store = createChildProfileStore(storage);
    const first = store.save({ name: "첫째", ...newborn });
    const second = store.save({
      name: "둘째",
      months: 12,
      height: 76,
      weight: 10,
    });
    expect(store.select(first.id)).toBe(true);
    expect(createChildProfileStore(storage).current()?.id).toBe(first.id);
    const updated = store.save(
      { name: "  첫째 새 이름  ", months: 1, height: 55.5, weight: 5.2 },
      first.id,
    );
    expect(updated).toEqual({
      id: first.id,
      name: "첫째 새 이름",
      months: "1",
      height: "55.5",
      weight: "5.2",
    });
    expect(store.all()).toHaveLength(2);
    expect(store.all()[1].id).toBe(second.id);
    expect(createChildProfileStore(storage).current()).toEqual(updated);
  });

  it("leaves children, selection and mirrors unchanged after rejected primary save/select/delete writes", () => {
    const { storage, data, blocked } = memoryStorage({
      months: "0",
      height: "50",
      weight: "4",
    });
    const store = createChildProfileStore(storage);
    const second = store.save({
      name: "둘째",
      months: 12,
      height: 76,
      weight: 10,
    });
    store.select("child-legacy");
    const before = Object.fromEntries(data);
    const children = store.all();
    blocked.add(primaryKey);
    expect(() =>
      store.save(
        { name: "변경", months: 2, height: 56, weight: 5 },
        "child-legacy",
      ),
    ).toThrow("quota");
    expect(() => store.save(newborn)).toThrow("quota");
    expect(() => store.select(second.id)).toThrow("quota");
    expect(() => store.remove("child-legacy")).toThrow("quota");
    expect(store.all()).toEqual(children);
    expect(store.current()?.id).toBe("child-legacy");
    expect(Object.fromEntries(data)).toEqual(before);
  });

  it("does not add an in-memory profile when an initial save fails", () => {
    const { storage, blocked } = memoryStorage();
    blocked.add(primaryKey);
    const store = createChildProfileStore(storage);
    expect(() => store.save(newborn)).toThrow("quota");
    expect(store.all()).toEqual([]);
    expect(store.current()).toBeNull();
  });

  it("commits profiles even when compatibility mirror writes or removals fail", () => {
    const { storage, data, blocked } = memoryStorage({ months: "stale" });
    blocked.add("months");
    const store = createChildProfileStore(storage);
    const saved = store.save({ name: "첫째", ...newborn }, "child-legacy");
    expect(store.all()).toHaveLength(1);
    expect(createChildProfileStore(storage).current()).toEqual(saved);
    expect(data.get("months")).toBe("stale");
    expect(data.get("height")).toBe("50");
    expect(store.remove(saved.id)).toBe(true);
    expect(store.current()).toBeNull();
    expect(data.get("height")).toBeUndefined();
    expect(data.get("weight")).toBeUndefined();
    expect(createChildProfileStore(storage).all()).toEqual([]);
  });

  it("selects the first remaining child after removing the active child and removes final mirrors", () => {
    const { storage, removed } = memoryStorage();
    const store = createChildProfileStore(storage);
    const first = store.save(newborn);
    const second = store.save({ months: 12, height: 76, weight: 10 });
    expect(store.remove(second.id)).toBe(true);
    expect(store.current()?.id).toBe(first.id);
    expect(storage.getItem("months")).toBe("0");
    expect(store.remove(first.id)).toBe(true);
    expect(removed).toEqual(new Set(["months", "height", "weight"]));
    expect(JSON.parse(storage.getItem(primaryKey)!)).toEqual({
      version: 1,
      selectedId: null,
      children: [],
    });
  });

  it("ignores unknown selection/deletion IDs without writing storage", () => {
    const { storage } = memoryStorage();
    const write = vi.spyOn(storage, "setItem");
    const store = createChildProfileStore(storage);
    expect(store.select("missing")).toBe(false);
    expect(store.remove("missing")).toBe(false);
    expect(write).not.toHaveBeenCalled();
  });

  it.each([
    { months: "1.5" },
    { months: -1 },
    { months: 181 },
    { months: "" },
    { height: 29 },
    { height: 191 },
    { height: Infinity },
    { height: null },
    { weight: 0 },
    { weight: 101 },
    { weight: "bad" },
    { weight: undefined },
  ])("rejects invalid measurement %j before any storage write", (invalid) => {
    const { storage } = memoryStorage();
    const write = vi.spyOn(storage, "setItem");
    const store = createChildProfileStore(storage);
    expect(() => store.save({ ...newborn, ...invalid })).toThrow(
      "월령·키·몸무게를 범위에 맞게 입력해 주세요.",
    );
    expect(store.all()).toEqual([]);
    expect(write).not.toHaveBeenCalled();
  });

  it("accepts inclusive measurement bounds and truncates trimmed names", () => {
    const { storage } = memoryStorage();
    const store = createChildProfileStore(storage);
    expect(store.save({ months: 0, height: 30, weight: 1 }).name).toBe(
      "아이 1",
    );
    expect(
      store.save({
        name: `  ${"a".repeat(25)}  `,
        months: 180,
        height: 190,
        weight: 100,
      }).name,
    ).toBe("a".repeat(20));
  });

  it("returns detached profile snapshots", () => {
    const { storage } = memoryStorage();
    const store = createChildProfileStore(storage);
    const saved = store.save(newborn);
    saved.months = "99";
    store.all()[0].name = "changed";
    store.current()!.height = "99";
    expect(store.current()).toEqual({
      id: saved.id,
      name: "아이 1",
      ...newborn,
    });
  });

  it("initializes safely with denied reads and keeps child writes atomic", () => {
    const storage: BrowserStorage = {
      getItem() {
        throw new Error("denied");
      },
      setItem() {
        throw new Error("denied");
      },
      removeItem() {
        throw new Error("denied");
      },
    };
    const store = createChildProfileStore(storage);
    expect(store.all()).toEqual([]);
    expect(() => store.save(newborn)).toThrow("denied");
    expect(store.all()).toEqual([]);
  });

  it("does not access browser storage until store operations need it", () => {
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
      const store = createChildProfileStore(browserStorage);
      expect(store.current()).toBeNull();
      expect(() => store.save(newborn)).toThrow("storage denied");
      expect(store.current()).toBeNull();
    } finally {
      if (descriptor)
        Object.defineProperty(globalThis, "localStorage", descriptor);
      else Reflect.deleteProperty(globalThis, "localStorage");
    }
  });
});
