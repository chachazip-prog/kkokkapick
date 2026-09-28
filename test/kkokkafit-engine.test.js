import assert from "node:assert/strict";
import {extractSizes,evaluateFit} from "../src/kkokkafit-engine.js";
assert.deepEqual(extractSizes("베이비 상하복 80 90 100"),[80,90,100]);
assert.equal(evaluateFit({months:8,height:70,weight:8},{name:"아기 상하복"}).status,"insufficient_product_data");
assert.equal(evaluateFit({months:8,height:70,weight:8},{name:"아기 상하복 80 90"}).status,"size_chart_required");
assert.equal(evaluateFit({months:8,height:null,weight:8},{name:"아기 상하복 80"}).status,"profile_required");
console.log("kkokkafit tests passed");
