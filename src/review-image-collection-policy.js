// Review collection may retain rejected originals only until quarantine and the
// independent full-image gate. Production discovery keeps its80% source gate.
export function isReviewQuarantineCollection(env = process.env) {
  const mode = env.ADPICK_COLLECTION_MODE || 'production';
  if (mode === 'production') return false;
  if (mode !== 'review-quarantine') throw new Error('Unknown ADPICK collection mode');
  if (env.GITHUB_REPOSITORY !== 'chachazip-prog/kkokkapick' ||
      env.GITHUB_REF !== 'refs/heads/codex/release-ui-rebuild' ||
      env.GITHUB_EVENT_NAME !== 'workflow_dispatch') {
    throw new Error('Review quarantine collection requires a manual canonical review-branch run');
  }
  return true;
}

export function assertCollectionImageHealth(imageHealth, minRate, reviewQuarantine = false) {
  if (!Number.isFinite(minRate) || minRate < 0 || minRate > 1) throw new Error('Invalid minimum image health rate');
  if (!Number.isFinite(imageHealth.rate) || imageHealth.rate < 0 || imageHealth.rate > 1) throw new Error('Invalid image health rate');
  if (!imageHealth.checked) throw new Error('No original images checked');
  if (imageHealth.rate < minRate && !reviewQuarantine) {
    throw new Error(`Refusing catalog publication: live image health ${(imageHealth.rate * 100).toFixed(1)}% < ${(minRate * 100).toFixed(1)}%`);
  }
}

export function collectionProducts(originals, validated, reviewQuarantine = false) {
  if (originals.length !== validated.length) throw new Error('Incomplete collection image audit');
  return validated.map(({ imageHealth, ...product }, index) => ({
    ...product,
    imageUrl: imageHealth.ok ? product.imageUrl : null,
    imageEvidence: imageHealth.ok && originals[index].imageUrl ? {
      url: originals[index].imageUrl, observedAt: product.checkedAt,
      verifiedAt: imageHealth.checkedAt, status: imageHealth.status,
    } : null,
    ...(reviewQuarantine ? { collectionImageHealth: {
      ...imageHealth, url: originals[index].imageUrl, observedAt: product.checkedAt,
    } } : {}),
  }));
}
