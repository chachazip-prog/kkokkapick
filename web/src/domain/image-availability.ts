export type ImageRecoveryStatus =
  "available" | "unavailable" | "offline" | "stale";
export interface ImageProduct {
  imageUrl?: unknown;
  imageUrls?: unknown;
}
export interface ImageAvailabilityState {
  setSnapshot(value: unknown, now?: number): boolean;
  urls(product?: ImageProduct): string[];
  markFailed(url: string, token?: number): boolean;
  recover(url: string, token?: number): Promise<ImageRecoveryStatus>;
  generation(): number;
  failedCount(): number;
}

export interface ImageAvailabilityOptions {
  probeImpl?: (url: string) => Promise<boolean>;
  waitImpl?: (milliseconds: number) => Promise<void>;
  onlineImpl?: () => boolean;
}

export function imageProbe(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const image = new Image();
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      image.onload = image.onerror = null;
      resolve(ok);
    };
    const timer = setTimeout(() => {
      finish(false);
      image.removeAttribute("src");
    }, 5000);
    image.onload = () => finish(image.naturalWidth > 0);
    image.onerror = () => finish(false);
    image.src = url;
  });
}

/** Transient memory only. Photos stay provider hosted; retries never renew TTL. */
export function createImageAvailabilityState({
  probeImpl = imageProbe,
  waitImpl = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds)),
  onlineImpl = () =>
    typeof navigator === "undefined" || navigator.onLine !== false,
}: ImageAvailabilityOptions = {}): ImageAvailabilityState {
  let stamp: number | null = null,
    generation = 0;
  const failed = new Set<string>(),
    recoveries = new Map<string, Promise<ImageRecoveryStatus>>();
  const validUrl = (value: unknown): value is string =>
    typeof value === "string" && /^https:\/\//.test(value);
  const markFailed = (url: string, token = generation) => {
    if (token !== generation || !onlineImpl() || !validUrl(url)) return false;
    failed.add(url);
    return true;
  };
  return {
    setSnapshot(value, now = Date.now()) {
      const next = typeof value === "string" ? Date.parse(value) : NaN;
      if (
        !Number.isFinite(next) ||
        next > now + 300000 ||
        (stamp !== null && next <= stamp)
      )
        return false;
      stamp = next;
      generation++;
      failed.clear();
      recoveries.clear();
      return true;
    },
    urls(product = {}) {
      const urls = [
        product.imageUrl,
        ...(Array.isArray(product.imageUrls) ? product.imageUrls : []),
      ];
      return [
        ...new Set(
          urls.filter(
            (url): url is string => validUrl(url) && !failed.has(url),
          ),
        ),
      ];
    },
    markFailed,
    recover(url, token = generation) {
      if (token !== generation) return Promise.resolve("stale");
      if (!onlineImpl()) return Promise.resolve("offline");
      if (!validUrl(url) || failed.has(url))
        return Promise.resolve("unavailable");
      const existing = recoveries.get(url);
      if (existing) return existing;
      const task = (async (): Promise<ImageRecoveryStatus> => {
        for (const delay of [350, 900]) {
          await waitImpl(delay);
          if (token !== generation) return "stale";
          if (!onlineImpl()) return "offline";
          let ok = false;
          try {
            ok = await probeImpl(url);
          } catch {
            /* Decode/network failure shares the same bounded retry. */
          }
          if (token !== generation) return "stale";
          if (!onlineImpl()) return "offline";
          if (ok) return "available";
        }
        markFailed(url, token);
        return "unavailable";
      })().then((result) => {
        if (result === "offline" && token === generation)
          recoveries.delete(url);
        return result;
      });
      recoveries.set(url, task);
      return task;
    },
    generation: () => generation,
    failedCount: () => failed.size,
  };
}
