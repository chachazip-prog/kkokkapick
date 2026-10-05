import assert from "node:assert/strict";
import { ADPICK_DISCOVERY_QUERIES, ADPICK_BROAD_QUERY_CANARIES, ADPICK_SEARCH_LIMIT, ADPICK_DISCOVERY_PACING_MS } from "../src/adpick-discovery-plan.js";

assert.ok(ADPICK_DISCOVERY_QUERIES.length >= 70);
for (const q of ["아기옷","유아복","아동복","키즈옷","베이비옷","여아옷","남아옷","아기 여름옷","아기 겨울옷","유아 여름옷","유아 겨울옷","아동 티셔츠","아동 바지","아동 원피스","아동 상하복","여아 원피스","여아 티셔츠","여아 바지","남아 티셔츠","남아 바지","남아 상하복","아동 맨투맨","아동 셔츠","아동 자켓","아동 점퍼"]) assert.ok(ADPICK_DISCOVERY_QUERIES.includes(q));
assert.equal(new Set(ADPICK_DISCOVERY_QUERIES).size, ADPICK_DISCOVERY_QUERIES.length);
assert.equal(ADPICK_SEARCH_LIMIT, 20);
assert.deepEqual(ADPICK_BROAD_QUERY_CANARIES, ["아기옷", "유아복", "아동복", "키즈옷", "베이비옷"]);
assert.equal(new Set(ADPICK_BROAD_QUERY_CANARIES).size, ADPICK_BROAD_QUERY_CANARIES.length);
assert.ok(ADPICK_DISCOVERY_PACING_MS >= 6000);
for (const q of ADPICK_DISCOVERY_QUERIES) assert.match(q, /(신생아|아기|유아|키즈|아동|아동복|베이비|여아|남아|토들러)/);
console.log("ADPICK discovery plan tests passed");

assert.equal(ADPICK_DISCOVERY_QUERIES.length, 85);
for (const q of ["아기 수면조끼","유아 수영복","키즈 래쉬가드","유아 한복","토들러 옷","아기 롬퍼"]) assert.ok(ADPICK_DISCOVERY_QUERIES.includes(q));
