import assert from "node:assert/strict";
import { displayProductName, groupProducts } from "../src/product-grouper.js";

// Release regression for #110 title-cleanliness and real gallery aggregation.
assert.equal(
  displayProductName("[롯데백화점] [에뜨와] 미우 배냇수트"),
  "[에뜨와] 미우 배냇수트",
);
assert.equal(
  displayProductName("[보리보리][현대백화점] 모이몰른 바디수트"),
  "모이몰른 바디수트",
);
assert.equal(
  displayProductName("[에뜨와] 벤자민 스트라이프 티셔츠"),
  "[에뜨와] 벤자민 스트라이프 티셔츠",
);

const grouped=groupProducts([
  {
    externalProductId:"a",
    name:"[롯데백화점] [에뜨와] 미우 배냇수트 07T717903",
    merchant:"롯데백화점",
    price:79000,
    affiliateUrl:"https://example.com/a",
    imageUrl:"https://cdn.example.com/a.jpg",
  },
  {
    externalProductId:"b",
    name:"[에뜨와] 미우 배냇수트 07T717903",
    merchant:"GS SHOP",
    price:76440,
    affiliateUrl:"https://example.com/b",
    imageUrl:"https://cdn.example.com/b.jpg",
  },
  {
    externalProductId:"c",
    name:"[현대백화점] [에뜨와] 미우 배냇수트 07T717903",
    merchant:"Hmall",
    price:78000,
    affiliateUrl:"https://example.com/c",
    imageUrl:"https://cdn.example.com/b.jpg",
  },
]);

assert.equal(grouped.length,1);
assert.equal(grouped[0].name,"[에뜨와] 미우 배냇수트 07T717903");
assert.equal(grouped[0].offerCount,3);
assert.deepEqual(grouped[0].imageUrls,[
  "https://cdn.example.com/a.jpg",
  "https://cdn.example.com/b.jpg",
]);
assert.equal(grouped[0].imageUrl,"https://cdn.example.com/a.jpg");
assert.equal(grouped[0].minPrice,76440);

console.log("product grouper release tests passed");
