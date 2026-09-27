export class ProviderAdapter {
  constructor(config){ this.config=config; }
  async fetchChanges(cursor){ throw new Error("fetchChanges() must be implemented"); }
  normalize(raw){ throw new Error("normalize() must be implemented"); }
  getStoragePolicy(){ return this.config.storagePolicy; }
  getCacheTtlMinutes(){ return this.config.cacheTtlMinutes ?? null; }
}
// Provider-specific implementations must enforce each provider's caching/storage/affiliate terms.
