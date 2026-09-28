import assert from "node:assert/strict";
import {assertStorageAllowed,providerPolicy} from "../src/provider-policy.js";

assert.equal(providerPolicy("adpick_biz").storagePolicy,"ttl_cache");
assert.equal(providerPolicy("linkprice").storagePolicy,"realtime_only");
assert.throws(()=>assertStorageAllowed("adpick_biz","persistent"));
assert.doesNotThrow(()=>assertStorageAllowed("adpick_biz","ttl_cache"));
assert.throws(()=>assertStorageAllowed("linkprice","ttl_cache"));
assert.equal(providerPolicy("unknown").storagePolicy,"realtime_only");
console.log("provider policy tests passed");
