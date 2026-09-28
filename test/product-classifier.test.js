import assert from "node:assert/strict";
import {classifyCategory,classifyStage} from "../src/product-classifier.js";
assert.equal(classifyCategory("모이몰른 신생아 반팔 바디슈트"),"바디수트");
assert.equal(classifyCategory("빈폴키즈 피나포어 원피스"),"원피스");
assert.equal(classifyCategory("밍크뮤 경량 패딩 우주복"),"바디수트");
assert.equal(classifyStage("신생아 바디수트"),"신생아");
assert.equal(classifyStage("키즈 티셔츠"),"키즈");
assert.equal(classifyStage("유아 상하복"),"유아");
console.log("classifier tests passed");

const verified=classifyProduct({name:"아가방 베이비 상하복",query:"아기 상하복"});
assert.equal(verified.brand,"아가방");
assert.equal(verified.fitStatus,"verified");
const candidate=classifyProduct({name:"밍크뮤 베베 우주복",query:"아기 우주복"});
assert.equal(candidate.fitStatus,"candidate");
const unknown=classifyProduct({name:"일반 유아 티셔츠",query:"유아 티셔츠"});
assert.equal(unknown.fitStatus,"unverified");
