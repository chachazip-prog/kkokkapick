export async function probeImageUrl(url, {
  fetchImpl = fetch, timeoutMs = 5000, retryLimit = 2,
  waitImpl = ms => new Promise(resolve => setTimeout(resolve, ms)),
} = {}) {
  if (!url) return { ok: false, status: null, contentType: '', reason: 'missing' };
  let parsed;
  try { parsed = new URL(url); } catch { return { ok: false, status: null, contentType: '', reason: 'invalid_url' }; }
  if (parsed.protocol !== 'https:') return { ok: false, status: null, contentType: '', reason: 'non_https' };
  const retries = Math.max(0, Math.min(2, retryLimit));
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
    let health, retryAfter = null;
    try {
      const response = await fetchImpl(parsed, { redirect: 'follow', signal: controller.signal,
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; KKOKKAPICKImageValidation/1.0)', 'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' } });
      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      retryAfter = response.headers.get('retry-after');
      try { await response.body?.cancel(); } catch {}
      health = { ok: response.ok && contentType.startsWith('image/'), status: response.status, contentType,
        reason: response.ok ? (contentType.startsWith('image/') ? null : 'non_image') : 'http_error', attempts: attempt + 1 };
    } catch (error) {
      health = { ok: false, status: null, contentType: '', reason: error?.name === 'AbortError' ? 'timeout' : 'fetch_error', attempts: attempt + 1 };
    } finally { clearTimeout(timer); }
    // The gateway returned400 and then200 for the same valid URL in live checks.
    // Never retry404: it is the observed expired-image failure.
    const retryable = health.status === null || [400,408,429,500,502,503,504].includes(health.status);
    if (health.ok || !retryable || attempt === retries) return health;
    const seconds = retryAfter && /^\d+(?:\.\d+)?$/.test(retryAfter) ? Number(retryAfter) : null;
    const date = retryAfter && seconds === null ? Date.parse(retryAfter) : NaN;
    const requested = seconds !== null ? seconds * 1000 : Number.isFinite(date) ? date - Date.now() : [250,750][attempt];
    if (requested > 5000) return { ...health, reason: 'retry_later' };
    await waitImpl(Math.max(250, requested));
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
