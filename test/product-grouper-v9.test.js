import assert from "node:assert/strict";
import { groupProducts, normalizeProductName } from "../src/product-grouper.js";

assert.equal(normalizeProductName("[롯데백화점] [에뜨와] 큐엘 바디수트 07T517908_YS"),"에뜨와 큐엘 바디수트 07t517908 ys");
assert.equal(normalizeProductName("[에뜨와] 큐엘 바디수트"),"에뜨와 큐엘 바디수트");

const rows=[
  {externalProductId:"lot-1",name:"[롯데백화점] [에뜨와] 큐엘바디수트 07T517908_YS",merchant:"롯데백화점",merchantDomain:"lotte.test",price:75550,affiliateUrl:"https://lotte.test/a",imageUrl:"https://img.test/1.jpg",cat:"바디수트"},
  {externalProductId:"bori-9",name:"보리보리 [에뜨와] 큐엘바디수트 07T517908_YS",merchant:"보리보리",merchantDomain:"bori.test",price:68450,affiliateUrl:"https://bori.test/a",imageUrl:"https://img.test/2.jpg",cat:"바디수트"},
  {externalProductId:"other",name:"[에뜨와] 큐엘바디수트 07T517999_YS",merchant:"G마켓",merchantDomain:"g.test",price:62000,affiliateUrl:"https://g.test/b",imageUrl:"http://insecure.test/x.jpg",cat:"바디수트"},
];
const grouped=groupProducts(rows);
assert.equal(grouped.length,2,"different model codes must not be merged");
const canonical=grouped.find(p=>p.offers.length===2);
assert.ok(canonical);
assert.equal(canonical.minPrice,68450);
assert.equal(canonical.maxPrice,75550);
assert.equal(canonical.offerCount,2);
assert.deepEqual(canonical.imageUrls,["https://img.test/1.jpg","https://img.test/2.jpg"]);
assert.equal(canonical.imageUrl,"https://img.test/1.jpg");
assert.equal(grouped.find(p=>p.id==="other").imageUrl,null,"non-HTTPS product images are not propagated");

const invalid=groupProducts([{externalProductId:"x",name:"테스트 상품",merchant:"m",price:0,affiliateUrl:"https://m.test/x",imageUrl:"https://img.test/x.jpg"}]);
assert.equal(invalid[0].minPrice,null);
assert.equal(invalid[0].maxPrice,null);

console.log("product grouper v9 tests passed");
