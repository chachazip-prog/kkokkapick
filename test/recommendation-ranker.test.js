import assert from "node:assert/strict";
import { recommendationScore, compareRecommended } from "../src/recommendation-ranker.js";

const verified={id:"v",fitStatus:"verified",brand:"아가방",offerCount:1,minPrice:20000,stage:"베이비"};
const plain={id:"p",fitStatus:"unverified",brand:null,offerCount:1,minPrice:10000,stage:"베이비"};
assert.ok(recommendationScore(verified)>recommendationScore(plain));

const multi={id:"m",fitStatus:"unverified",brand:"브랜드",offerCount:3,minPrice:30000,stage:"유아"};
const single={id:"s",fitStatus:"unverified",brand:"브랜드",offerCount:1,minPrice:20000,stage:"유아"};
assert.ok(recommendationScore(multi)>recommendationScore(single));

assert.ok(recommendationScore(plain,{stage:"베이비"})>recommendationScore(plain,{stage:"키즈"}));
assert.equal([plain,verified].sort((a,b)=>compareRecommended(a,b,{stage:"베이비"}))[0].id,"v");
console.log("recommendation ranker tests passed");
