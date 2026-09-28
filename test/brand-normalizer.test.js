import assert from "node:assert/strict";
import {normalizeBrand} from "../src/brand-normalizer.js";
assert.equal(normalizeBrand("[현대백화점] [에뜨와HB] 레니아바디수트"),"에뜨와");
assert.equal(normalizeBrand("[BEANPOLE KIDS] 클래식 피나포어 원피스"),"빈폴키즈");
assert.equal(normalizeBrand("[밍크뮤] 에코퍼아우터우주복"),"밍크뮤");
assert.equal(normalizeBrand("일반 유아 상하복"),null);
console.log("brand normalizer tests passed");
