// Only explicit provider attributes count as facts. Titles and brand charts are
// never evidence of a product's composition or currently offered sizes.
export function providerProductFacts(raw = {}) {
  const materialKey = ['material', 'materials', 'composition', 'fabric'].find(key =>
    typeof raw[key] === 'string' && raw[key].trim() ||
    Array.isArray(raw[key]) && raw[key].some(value => typeof value === 'string' && value.trim()));
  const materialValue = materialKey ? raw[materialKey] : null;
  const material = typeof materialValue === 'string' ? materialValue.trim() :
    Array.isArray(materialValue) ? materialValue.filter(value => typeof value === 'string' && value.trim()).map(value => value.trim()).join(', ') : null;
  // Generic `size` / `sizes` may be a chart, not live purchase options.
  const sizeKey = ['availableSizes', 'available_sizes', 'size_options'].find(key => Array.isArray(raw[key]));
  const sizeOptions = sizeKey ? raw[sizeKey] : [];
  const availableSizes = [...new Set(sizeOptions.flatMap(option => {
    if (typeof option === 'string' || typeof option === 'number') return String(option).trim() ? [String(option).trim()] : [];
    if (!option || typeof option !== 'object') return [];
    if (option.available === false || option.in_stock === false || option.sold_out === true || option.stock === 0 || option.stock === '0' || option.is_available === false || option.stock_quantity === 0) return [];
    const label = option.size ?? option.label ?? option.name;
    return typeof label === 'string' || typeof label === 'number' ? [String(label).trim()].filter(Boolean) : [];
  }))];
  return {
    material,
    availableSizes,
    productFactFields: { material: material ? materialKey : null, availableSizes: availableSizes.length ? sizeKey : null }
  };
}

export function catalogCacheWindow(syncedAt, ttlHours = 24) {
  const time = Date.parse(syncedAt);
  if (!Number.isFinite(time) || !Number.isFinite(ttlHours) || ttlHours <= 0) throw new Error('Invalid catalog cache window');
  return { storagePolicy: 'ttl_cache', syncedAt, expiresAt: new Date(time + ttlHours * 3600000).toISOString() };
}
