const fs = require('fs');

const catalogBytes = fs.readFileSync(process.env.CATALOG_IMAGE_HEALTH_INPUT || 'data/catalog.json');
const raw = JSON.parse(catalogBytes.toString('utf8'));
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

async function main() {
  const { probeImageUrl } = await import('../src/image-health.js');
  const selected = process.env.IMAGE_HEALTH_ALL === '1' ? urls : deterministicSample(urls, sampleSize);
  async function auditAllSelected(){
    let cursor=0;const results=new Array(selected.length);
    async function worker(){while(true){const index=cursor++;if(index>=selected.length)return;results[index]={url:selected[index],...await probeImageUrl(selected[index],{timeoutMs})}}}
    await Promise.all(Array.from({length:Math.min(concurrency,selected.length)},worker));return results;
  }
  let results=await auditAllSelected();let fullRecheck=null;
  if(process.env.IMAGE_HEALTH_FULL_RECHECK_ON_TRANSIENT==='1'&&process.env.IMAGE_HEALTH_ALL==='1'&&minSuccessRate===1){
    const {transportRecheckCandidates}=await import('../src/image-publication-policy.js');
    const failures=transportRecheckCandidates(results,selected);
    if(failures.length){
      await new Promise(resolve=>setTimeout(resolve,15000));
      const confirmation=[];
      // A400 must actually recover on the same original URL before another full audit.
      for(const failure of failures.filter(r=>r.status===400))confirmation.push({url:failure.url,...await probeImageUrl(failure.url,{timeoutMs,retryLimit:0})});
      fullRecheck={firstChecked:results.length,firstFailed:failures.length,firstFailures:failures,confirmation,performed:confirmation.every(r=>r.ok)};
      if(fullRecheck.performed)results=await auditAllSelected();
    }
  }

  const okCount = results.filter((result) => result.ok).length;
  const successRate = results.length ? okCount / results.length : 0;
  const report = {
    generatedAt: new Date().toISOString(),
    catalogProductCount: items.length,
    catalogSyncedAt: raw.syncedAt ?? null,
    catalogExpiresAt: raw.expiresAt ?? null,
    catalogSha256: require('node:crypto').createHash('sha256').update(catalogBytes).digest('hex'),
    uniqueHttpsImageUrls: urls.length,
    sampleSize: results.length,
    ok: okCount,
    failed: results.length - okCount,
    successRate,
    minSuccessRate,
    fullRecheck,
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
