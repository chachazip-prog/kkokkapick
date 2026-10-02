export async function probeImageUrl(url, {
  fetchImpl = fetch,
  timeoutMs = 5000,
} = {}) {
  if (!url) return { ok: false, status: null, contentType: "", reason: "missing" };
  let parsed;
  try { parsed = new URL(url); } catch { return { ok: false, status: null, contentType: "", reason: "invalid_url" }; }
  if (parsed.protocol !== "https:") return { ok: false, status: null, contentType: "", reason: "non_https" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(parsed, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; KKOKKAPICKImageValidation/1.0)",
        "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    try { await response.body?.cancel(); } catch {}
    return {
      ok: response.ok && contentType.startsWith("image/"),
      status: response.status,
      contentType,
      reason: response.ok ? (contentType.startsWith("image/") ? null : "non_image") : "http_error",
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      contentType: "",
      reason: error?.name === "AbortError" ? "timeout" : "fetch_error",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function validateProductImages(products, {
  fetchImpl = fetch,
  timeoutMs = 5000,
  concurrency = 10,
} = {}) {
  const queue = products.map((product, index) => ({ product, index }));
  const results = new Array(products.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const current = cursor++;
      if (current >= queue.length) return;
      const { product, index } = queue[current];
      const health = await probeImageUrl(product.imageUrl, { fetchImpl, timeoutMs });
      results[index] = {
        ...product,
        imageUrl: health.ok ? product.imageUrl : null,
        imageHealth: {
          ok: health.ok,
          status: health.status,
          contentType: health.contentType,
          reason: health.reason,
          checkedAt: new Date().toISOString(),
        },
      };
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, products.length || 1)) }, worker));
  return results;
}
