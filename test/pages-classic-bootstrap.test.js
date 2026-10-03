import assert from "node:assert/strict";
import fs from "node:fs";
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
assert.ok(!html.includes('<script type="module">'),"release Pages runtime must not depend on ES-module bootstrap");
assert.ok(!/^\s*import\s/m.test(html),"index must not contain static imports");
for(const token of ["function evaluateFit","function getLatestPriceChange","function compareRecommended","function loadCommercialHome","window.__kkokkapickBooted=true","loadProducts()"]){
  assert.ok(html.includes(token),token+" missing");
}
console.log("classic Pages bootstrap contract passed");
