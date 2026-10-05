// Exclude a small number of unavailable original photos without losing seller facts.
// A broad outage fails closed; the resulting catalog still needs an independent100% gate.
export function applyPublicationImageAudit(source, results, expectedUrls, checkedAt = new Date().toISOString()) {
  const expected = new Set(expectedUrls);
  if (!expected.size || results.length !== expected.size || new Set(results.map(r => r.url)).size !== expected.size || results.some(r => !expected.has(r.url))) throw new Error('Incomplete publication image audit');
  const failures = results.filter(r => !r.ok);
  if (failures.length / expected.size > 0.05) throw new Error('Image outage exceeds publication exclusion limit');
  const bad = new Map(failures.map(r => [r.url, r]));
  return { ...source, publicationImageAudit: { checkedAt, checked: expected.size, ok: expected.size - bad.size, excluded: bad.size,
    statuses: failures.reduce((counts, r) => {const key = String(r.status ?? r.reason ?? 'unknown');counts[key] = (counts[key] || 0) + 1;return counts}, {}) },
    products: source.products.map(p => bad.has(p.imageUrl) ? { ...p, imageUrl: null,
      imagePublicationFailure: { checkedAt, status: bad.get(p.imageUrl).status, reason: bad.get(p.imageUrl).reason } } : p) };
}

// One full, unchanged-set transport recheck is allowed only for narrow temporary failures.
export function transportRecheckCandidates(results, expectedUrls, round=1) {
  const expected=new Set(expectedUrls);
  if(round!==1||!expected.size||results.length!==expected.size||new Set(results.map(r=>r.url)).size!==expected.size||results.some(r=>!expected.has(r.url)))return [];
  const failures=results.filter(r=>!r.ok);
  if(!failures.length||failures.length/expected.size>0.01)return [];
  if(failures.some(r=>r.reason==='retry_later'||!( [400,408,500,502,503,504].includes(r.status)||(r.status===null&&['timeout','fetch_error'].includes(r.reason)))))return [];
  return failures;
}
