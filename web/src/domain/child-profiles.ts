import { browserStorage, LOCAL_STORAGE_KEYS, readRaw } from "./local-storage";
import type { BrowserStorage } from "./local-storage";

/** Profiles and compatibility measurements stay on this device. */
export interface ChildProfile {
  id: string;
  name: string;
  months: string;
  height: string;
  weight: string;
}

export type MeasurementInput = string | number | null | undefined;

export interface ChildProfileInput {
  name?: string;
  months: MeasurementInput;
  height: MeasurementInput;
  weight: MeasurementInput;
}

export interface ChildProfileStore {
  all(): ChildProfile[];
  current(): ChildProfile | null;
  select(id: string): boolean;
  save(input: ChildProfileInput, id?: string | null): ChildProfile;
  remove(id: string): boolean;
}

interface SavedChildProfiles {
  version: 1;
  selectedId: string | null;
  children: ChildProfile[];
}

const measurementKeys = ["months", "height", "weight"] as const;
type MeasurementKey = (typeof measurementKeys)[number];
const ranges: Record<MeasurementKey, readonly [number, number]> = {
  months: [0, 180],
  height: [30, 190],
  weight: [1, 100],
};

function measurement(value: unknown, key: MeasurementKey): string {
  if (value === null || value === undefined || value === "") return "";
  let number: number;
  try {
    number = Number(value);
  } catch {
    return "";
  }
  const [minimum, maximum] = ranges[key];
  return Number.isFinite(number) &&
    number >= minimum &&
    number <= maximum &&
    (key !== "months" || Number.isInteger(number))
    ? String(number)
    : "";
}

function profileName(value: unknown, fallback: string): string {
  try {
    return String(value || fallback);
  } catch {
    return fallback;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function readSaved(storage: BrowserStorage): unknown {
  try {
    return JSON.parse(
      readRaw(storage, LOCAL_STORAGE_KEYS.childProfiles) || "null",
    );
  } catch {
    return null;
  }
}

function newChildId(): string {
  return `child-${
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }`;
}

/** Primary write failures throw, retaining the legacy callable store contract. */
export function createChildProfileStore(
  storage: BrowserStorage = browserStorage,
): ChildProfileStore {
  const saved = readSaved(storage);
  const record = isObject(saved) ? saved : null;
  const seen = new Set<string>();
  let children: ChildProfile[] = [];

  if (Array.isArray(record?.children)) {
    for (const child of record.children) {
      if (
        !isObject(child) ||
        typeof child.id !== "string" ||
        child.id.length === 0 ||
        child.id.length > 100 ||
        seen.has(child.id)
      )
        continue;
      seen.add(child.id);
      children.push({
        id: child.id,
        name: profileName(child.name, "우리 아이").slice(0, 20),
        months: measurement(child.months, "months"),
        height: measurement(child.height, "height"),
        weight: measurement(child.weight, "weight"),
      });
    }
  }

  // A persisted primary record, including an explicitly empty children list,
  // wins over stale mirrors. Migration itself performs no writes.
  if (!saved && measurementKeys.some((key) => readRaw(storage, key) !== null)) {
    children = [
      {
        id: "child-legacy",
        name: "우리 아이",
        months: measurement(readRaw(storage, "months"), "months"),
        height: measurement(readRaw(storage, "height"), "height"),
        weight: measurement(readRaw(storage, "weight"), "weight"),
      },
    ];
  }

  let selectedId: string | null = children.some(
    (child) => child.id === record?.selectedId,
  )
    ? (record?.selectedId as string)
    : (children[0]?.id ?? null);
  const current = () =>
    children.find((child) => child.id === selectedId) ?? null;

  function commit(next: ChildProfile[], id: string | null): void {
    const snapshot: SavedChildProfiles = {
      version: 1,
      selectedId: id,
      children: next,
    };
    storage.setItem(LOCAL_STORAGE_KEYS.childProfiles, JSON.stringify(snapshot));
    children = next;
    selectedId = id;

    const child = current();
    for (const key of measurementKeys) {
      try {
        if (child) storage.setItem(key, child[key]);
        else storage.removeItem(key);
      } catch {
        // Compatibility mirrors are secondary; the primary record is committed.
      }
    }
  }

  return {
    all: () => children.map((child) => ({ ...child })),
    current: () => {
      const child = current();
      return child ? { ...child } : null;
    },

    select(id) {
      if (!children.some((child) => child.id === id)) return false;
      commit(children, id);
      return true;
    },

    save(input, id) {
      for (const key of measurementKeys) {
        if (measurement(input[key], key) === "") {
          throw new Error("월령·키·몸무게를 범위에 맞게 입력해 주세요.");
        }
      }
      const existing = children.find((child) => child.id === id);
      const child: ChildProfile = {
        id: existing?.id || newChildId(),
        name:
          String(input.name || "")
            .trim()
            .slice(0, 20) || `아이 ${children.length + 1}`,
        months: measurement(input.months, "months"),
        height: measurement(input.height, "height"),
        weight: measurement(input.weight, "weight"),
      };
      const next = existing
        ? children.map((item) => (item.id === id ? child : item))
        : [...children, child];
      commit(next, child.id);
      return { ...child };
    },

    remove(id) {
      if (!children.some((child) => child.id === id)) return false;
      const next = children.filter((child) => child.id !== id);
      commit(next, selectedId === id ? (next[0]?.id ?? null) : selectedId);
      return true;
    },
  };
}
