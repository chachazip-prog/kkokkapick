import assert from "node:assert/strict";
import { ADPICK_DISCOVERY_QUERIES, ADPICK_SEARCH_LIMIT, ADPICK_DISCOVERY_PACING_MS } from "../src/adpick-discovery-plan.js";

assert.ok(ADPICK_DISCOVERY_QUERIES.length >= 45);
assert.equal(new Set(ADPICK_DISCOVERY_QUERIES).size, ADPICK_DISCOVERY_QUERIES.length);
assert.equal(ADPICK_SEARCH_LIMIT, 20);
assert.ok(ADPICK_DISCOVERY_PACING_MS >= 6000);
for (const q of ADPICK_DISCOVERY_QUERIES) assert.match(q, /(신생아|아기|유아|키즈|아동복)/);
console.log("ADPICK discovery plan tests passed");
