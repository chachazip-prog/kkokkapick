import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalRecords } from "./use-local-records";
import { evaluateFit, LOCAL_STORAGE_KEYS } from "@/domain";

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("local records integration", () => {
  it("publishes the same committed favorite state when a storage event and local mutation share a batch", () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.favorites,
      JSON.stringify(["initial"]),
    );
    const { result } = renderHook(useLocalRecords);
    act(() => {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.favorites,
        JSON.stringify(["initial", "external"]),
      );
      window.dispatchEvent(
        new StorageEvent("storage", { key: LOCAL_STORAGE_KEYS.favorites }),
      );
      expect(result.current.toggleFavorite("local")).toBe(true);
    });
    expect(result.current.favorites).toEqual(["initial", "external", "local"]);
    expect(
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.favorites) || "null"),
    ).toEqual(result.current.favorites);
  });

  it("uses a newly selected child immediately after a cross-tab event, including a local save in that batch", () => {
    const first = {
      id: "first",
      name: "첫째",
      months: "12",
      height: "76",
      weight: "10",
    };
    const second = {
      id: "second",
      name: "둘째",
      months: "36",
      height: "92",
      weight: "14",
    };
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.childProfiles,
      JSON.stringify({
        version: 1,
        selectedId: first.id,
        children: [first, second],
      }),
    );
    const { result } = renderHook(useLocalRecords);
    act(() => {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.childProfiles,
        JSON.stringify({
          version: 1,
          selectedId: second.id,
          children: [first, second],
        }),
      );
      window.dispatchEvent(
        new StorageEvent("storage", { key: LOCAL_STORAGE_KEYS.childProfiles }),
      );
      expect(
        result.current.saveChild({ ...second, height: "93" }, second.id),
      ).toBe(true);
    });
    expect(result.current.activeChild).toMatchObject({
      id: second.id,
      height: "93",
    });
    expect(result.current.children).toHaveLength(2);
    expect(
      evaluateFit(result.current.activeChild, { brand: "아가방" }),
    ).toMatchObject({ status: "recommended", recommendedSize: "100" });
    const persisted = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.childProfiles) || "null",
    );
    expect(persisted.selectedId).toBe(second.id);
    expect(persisted.children).toEqual(result.current.children);
  });

  it("keeps rendered saved records and selected fit unchanged after quota failure", () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.favorites,
      JSON.stringify(["saved"]),
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.childProfiles,
      JSON.stringify({
        version: 1,
        selectedId: "first",
        children: [
          {
            id: "first",
            name: "첫째",
            months: "12",
            height: "76",
            weight: "10",
          },
        ],
      }),
    );
    const { result } = renderHook(useLocalRecords);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    act(() => {
      expect(result.current.toggleFavorite("unsaved")).toBe(false);
      expect(
        result.current.saveChild({
          name: "둘째",
          months: "36",
          height: "92",
          weight: "14",
        }),
      ).toBe(false);
    });
    expect(result.current.favorites).toEqual(["saved"]);
    expect(result.current.children).toHaveLength(1);
    expect(result.current.activeChild?.id).toBe("first");
    expect(result.current.error).toContain("아이 정보를 저장하지 못했어요");
    expect(
      evaluateFit(result.current.activeChild, { brand: "아가방" }),
    ).toMatchObject({ status: "recommended", recommendedSize: "80" });
  });
});
