import { useCallback, useEffect, useRef, useState } from "react";
import { createChildProfileStore, createShoppingStore } from "@/domain";
import type { ChildProfileInput } from "@/domain";

/** Compatible legacy keys; React changes only after the atomic local commit. */
export function useLocalRecords() {
  const [stores, setStores] = useState(() => ({
    children: createChildProfileStore(),
    shopping: createShoppingStore(),
  }));
  const latestStores = useRef(stores);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState("");
  const reread = useCallback(() => {
    const next = {
      children: createChildProfileStore(),
      shopping: createShoppingStore(),
    };
    // A storage event can share a React batch with a local mutation. Publish
    // its store synchronously so that mutation cannot write a stale snapshot.
    latestStores.current = next;
    setStores(next);
    setRevision((value) => value + 1);
  }, []);
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (
        !event.key ||
        [
          "kkokkapickChildProfiles",
          "months",
          "height",
          "weight",
          "favs",
          "priceAlerts",
          "recentProducts",
        ].includes(event.key)
      )
        reread();
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [reread]);
  const commit = useCallback((operation: () => unknown, message: string) => {
    try {
      if (operation() === false) throw new Error(message);
      setError("");
      setRevision((value) => value + 1);
      return true;
    } catch {
      setError(message);
      return false;
    }
  }, []);
  return {
    revision,
    error,
    clearError: () => setError(""),
    children: stores.children.all(),
    activeChild: stores.children.current(),
    favorites: stores.shopping.favorites(),
    targets: stores.shopping.priceAlerts(),
    recent: stores.shopping.recentProducts(),
    toggleFavorite: (id: string) =>
      commit(
        () => latestStores.current.shopping.toggleFavorite(id),
        "찜을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.",
      ),
    saveTarget: (id: string, price: string) =>
      commit(
        () => latestStores.current.shopping.setPriceAlert(id, price),
        "희망 가격을 저장하지 못했어요. 입력한 값은 그대로 남아 있어요.",
      ),
    recordRecent: (id: string) =>
      commit(
        () => latestStores.current.shopping.recordRecent(id),
        "최근 본 상품을 저장하지 못했어요. 상품은 계속 볼 수 있어요.",
      ),
    selectChild: (id: string) =>
      commit(
        () => latestStores.current.children.select(id),
        "선택한 아이를 저장하지 못했어요.",
      ),
    saveChild: (input: ChildProfileInput, id?: string | null) =>
      commit(
        () => latestStores.current.children.save(input, id),
        "아이 정보를 저장하지 못했어요. 입력값과 브라우저 저장 공간을 확인해 주세요.",
      ),
    removeChild: (id: string) =>
      commit(
        () => latestStores.current.children.remove(id),
        "아이 정보를 삭제하지 못했어요. 기존 정보는 보존되어 있어요.",
      ),
  };
}
