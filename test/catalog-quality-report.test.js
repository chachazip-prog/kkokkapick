import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const out=JSON.parse(execFileSync(process.execPath,["scripts/catalog-quality-report.js"],{encoding:"utf8"}));
assert.ok(out.sourceProducts>=out.canonicalProducts);
assert.ok(out.canonicalProducts>0);
assert.ok(out.recognizedBrandRatePct>=0&&out.recognizedBrandRatePct<=100);
assert.ok(out.canonicalImageRatePct>=0&&out.canonicalImageRatePct<=100);
if(out.sourceImageHealth){
  assert.equal(out.sourceImageHealth.checked,out.sourceImageHealth.ok+out.sourceImageHealth.failed);
}
assert.ok(Array.isArray(out.topBrands)&&Array.isArray(out.categories));
console.log("Catalog quality report contract passed");
