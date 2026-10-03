import assert from "node:assert/strict";
import { ADPICK_DISCOVERY_QUERIES, ADPICK_BROAD_QUERY_CANARIES, ADPICK_SEARCH_LIMIT, ADPICK_DISCOVERY_PACING_MS } from "../src/adpick-discovery-plan.js";

assert.ok(ADPICK_DISCOVERY_QUERIES.length >= 45);
assert.equal(new Set(ADPICK_DISCOVERY_QUERIES).size, ADPICK_DISCOVERY_QUERIES.length);
assert.equal(ADPICK_SEARCH_LIMIT, 20);
assert.deepEqual(ADPICK_BROAD_QUERY_CANARIES, ["아기옷", "유아복", "아동복", "키즈옷", "베이비옷"]);
assert.equal(new Set(ADPICK_BROAD_QUERY_CANARIES).size, ADPICK_BROAD_QUERY_CANARIES.length);
assert.ok(ADPICK_DISCOVERY_PACING_MS >= 6000);
for (const q of ADPICK_DISCOVERY_QUERIES) assert.match(q, /(신생아|아기|유아|키즈|아동복)/);
console.log("ADPICK discovery plan tests passed");
