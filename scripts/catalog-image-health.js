const fs = require('fs');

const raw = JSON.parse(fs.readFileSync(process.env.CATALOG_IMAGE_HEALTH_INPUT || 'data/catalog.json', 'utf8'));
const items = Array.isArray(raw) ? raw : (raw.products || raw.items || []);
const sampleSize = Math.max(1, Number.parseInt(process.env.IMAGE_HEALTH_SAMPLE_SIZE || '40', 10));
const timeoutMs = Math.max(1000, Number.parseInt(process.env.IMAGE_HEALTH_TIMEOUT_MS || '5000', 10));
const concurrency = Math.max(1, Math.min(10, Number.parseInt(process.env.IMAGE_HEALTH_CONCURRENCY || '5', 10)));
const minSuccessRate = Number.parseFloat(process.env.IMAGE_HEALTH_MIN_SUCCESS_RATE || '0.8');
const reportPath = process.env.IMAGE_HEALTH_REPORT;

const urls = [...new Set(items.flatMap((product) => {
  const values = [];
  if (typeof product.imageUrl === 'string' && product.imageUrl.startsWith('https://')) values.push(product.imageUrl);
  if (Array.isArray(product.imageUrls)) {
    for (const url of product.imageUrls) {
      if (typeof url === 'string' && url.startsWith('https://')) values.push(url);
    }
  }
  return values;
}))].sort();

function deterministicSample(values, wanted) {
  if (values.length <= wanted) return values;
  const sampled = [];
  for (let index = 0; index < wanted; index += 1) {
    const offset = Math.floor(index * values.length / wanted);
    sampled.push(values[offset]);
  }
  return sampled;
}

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; KKOKKAPICKImageHealth/1.0)',
        'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const ok = response.status >= 200 && response.status < 300 && contentType.startsWith('image/');
    if (response.body) await response.body.cancel().catch(() => {});
    return { url, ok, status: response.status, contentType };
  } catch (error) {
    return {
      url,
      ok: false,
      status: null,
      contentType: '',
      error: error && error.name === 'AbortError' ? 'timeout' : String(error && error.message ? error.message : error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const selected = process.env.IMAGE_HEALTH_ALL === '1' ? urls : deterministicSample(urls, sampleSize);
  let cursor = 0;
  const results = new Array(selected.length);
  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= selected.length) return;
      results[index] = await probe(selected[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, selected.length) }, worker));

  const okCount = results.filter((result) => result.ok).length;
  const successRate = results.length ? okCount / results.length : 0;
  const report = {
    generatedAt: new Date().toISOString(),
    catalogProductCount: items.length,
    uniqueHttpsImageUrls: urls.length,
    sampleSize: results.length,
    ok: okCount,
    failed: results.length - okCount,
    successRate,
    minSuccessRate,
    failures: results.filter((result) => !result.ok),
  };

  const output = JSON.stringify(report, null, 2);
  console.log(output);
  if (reportPath) {
    fs.mkdirSync(require('path').dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${output}\n`);
  }
  if (!results.length || successRate < minSuccessRate) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
