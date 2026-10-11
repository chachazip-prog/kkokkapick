import { useCallback, useEffect, useRef, useState } from "react";
import {
  CATALOG_REFRESH_INTERVAL_MS,
  createImageAvailabilityState,
  getVisibleProducts,
  isCatalogExpired,
  isOlderCatalogSnapshot,
  loadCatalog,
} from "@/domain";
import type { CatalogState } from "@/domain";

const dataBase = import.meta.env.DEV
  ? "/data/"
  : new URL("../data/", document.baseURI).href;

/** One request owner, one source clock, shared transient photo quarantine. */
export function useCatalog() {
  const [state, setState] = useState<CatalogState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const current = useRef(state);
  const request = useRef<AbortController | null>(null);
  const lastAttempt = useRef(0);
  const mounted = useRef(false);
  const [images] = useState(createImageAvailabilityState);

  const expire = useCallback(() => {
    const saved = current.current;
    if (saved?.catalog && isCatalogExpired(saved.catalog)) {
      const next: CatalogState = {
        ...saved,
        status: "expired",
        products: [],
        history: [],
        error: null,
      };
      current.current = next;
      setState(next);
    }
  }, []);

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    lastAttempt.current = Date.now();
    setRefreshing(true);
    try {
      const next = await loadCatalog(controller.signal, {
        baseUrl: dataBase,
        imageState: images,
      });
      if (!mounted.current || controller.signal.aborted) return;
      const saved = current.current;
      if (
        next.status === "unavailable" &&
        saved?.status === "ready" &&
        !isCatalogExpired(saved.catalog)
      ) {
        setRefreshFailed(true);
        return;
      }
      if (
        next.catalog &&
        saved?.catalog &&
        isOlderCatalogSnapshot(next.catalog, saved.catalog)
      ) {
        expire();
        return;
      }
      current.current = next;
      setState(next);
      setRefreshFailed(next.status === "unavailable");
    } catch (error) {
      if (controller.signal.aborted || !mounted.current) return;
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setRefreshFailed(true);
      expire();
      if (!current.current) {
        const next: CatalogState = {
          status: "unavailable",
          catalog: null,
          products: [],
          history: [],
          expiresAt: null,
          loadedAt: Date.now(),
          error: "catalog_unavailable",
        };
        current.current = next;
        setState(next);
      }
    } finally {
      if (mounted.current && request.current === controller)
        setRefreshing(false);
    }
  }, [expire, images]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const visible = () => {
      if (document.hidden) return;
      expire();
      if (Date.now() - lastAttempt.current >= CATALOG_REFRESH_INTERVAL_MS)
        void refresh();
    };
    const interval = window.setInterval(visible, CATALOG_REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("online", visible);
    return () => {
      mounted.current = false;
      request.current?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("online", visible);
    };
  }, [expire, refresh]);

  useEffect(() => {
    if (!state?.expiresAt || state.status !== "ready") return;
    const timer = window.setTimeout(
      expire,
      Math.min(Math.max(0, state.expiresAt - Date.now()), 2_147_483_647),
    );
    return () => window.clearTimeout(timer);
  }, [expire, state]);

  const recoverPhoto = useCallback(
    async (url: string, generation: number, afterReload = false) => {
      // One successful probe allows one rendered reload. A second online decode
      // failure must quarantine that URL instead of reusing its successful probe.
      const result = afterReload
        ? generation !== images.generation()
          ? "stale"
          : navigator.onLine === false
            ? "offline"
            : (images.markFailed(url, generation), "unavailable")
        : await images.recover(url, generation);
      if (!mounted.current || result === "stale") return result;
      const saved = current.current;
      if (saved?.status === "ready") {
        if (isCatalogExpired(saved.catalog)) expire();
        else if (result === "unavailable") {
          const next = {
            ...saved,
            products: getVisibleProducts(saved.catalog, Date.now(), images),
          };
          current.current = next;
          setState(next);
        }
      }
      return result;
    },
    [expire, images],
  );

  return { state, refreshing, refreshFailed, refresh, images, recoverPhoto };
}
