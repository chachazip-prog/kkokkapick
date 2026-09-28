export const STORAGE_POLICIES = Object.freeze({
  PERSISTENT: "persistent",
  TTL_CACHE: "ttl_cache",
  REALTIME_ONLY: "realtime_only"
});

export const PROVIDERS = Object.freeze({
  adpick_biz: {
    code: "adpick_biz",
    storagePolicy: STORAGE_POLICIES.TTL_CACHE,
    ttlHours: 24,
    policyVerified: false
  },
  linkprice: {
    code: "linkprice",
    storagePolicy: STORAGE_POLICIES.REALTIME_ONLY,
    ttlHours: 0,
    policyVerified: false,
    status: "awaiting_written_policy_clarification"
  }
});

export function providerPolicy(code) {
  const p=PROVIDERS[code];
  if(!p) return {code,storagePolicy:STORAGE_POLICIES.REALTIME_ONLY,ttlHours:0,policyVerified:false};
  return p;
}

export function assertStorageAllowed(code, mode) {
  const p=providerPolicy(code);
  if(mode==="persistent" && p.storagePolicy!==STORAGE_POLICIES.PERSISTENT)
    throw new Error(`${code}: persistent storage is not permitted by current policy state`);
  if(mode==="ttl_cache" && p.storagePolicy===STORAGE_POLICIES.REALTIME_ONLY)
    throw new Error(`${code}: caching is not permitted by current policy state`);
  return true;
}
