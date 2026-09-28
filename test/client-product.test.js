import assert from "node:assert/strict";
import { toClientProduct } from "../src/client-product.js";

const p=toClientProduct({
 id:123,name:"테스트",brand:"아가방",category:"상의",stage:"베이비",fitStatus:"verified",
 offers:[
  {merchant:"A",price:"12000",originalPrice:"15000",affiliateUrl:"https://example.com/a"},
  {merchant:"B",price:10000,affiliateUrl:"https://example.com/b"}
 ]
});
assert.equal(p.id,"123");
assert.equal(p.minPrice,10000);
assert.equal(p.maxPrice,12000);
assert.equal(p.offerCount,2);
assert.equal(p.offers[0].originalPrice,15000);
assert.equal(toClientProduct({fitStatus:"bad"}).fitStatus,"unverified");
console.log("client product tests passed");
