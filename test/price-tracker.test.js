import assert from "node:assert/strict";
import { buildPriceChanges, latestPriceChange, isTargetPriceReached } from "../src/price-tracker.js";

const at="2026-09-28T12:00:00.000Z";
const changes=buildPriceChanges(
  [{id:"a",minPrice:30000},{id:"b",minPrice:20000},{id:"c",minPrice:10000}],
  [{id:"a",minPrice:25000},{id:"b",minPrice:22000},{id:"c",minPrice:10000},{id:"d",minPrice:9000}],
  at
);
assert.equal(changes.length,2);
assert.deepEqual(changes[0],{productId:"a",observedAt:at,previousPrice:30000,price:25000,direction:"down",changeAmount:-5000});
assert.equal(changes[1].direction,"up");
const unordered=[
  {productId:"a",observedAt:"2026-09-28T14:00:00.000Z",price:24000},
  {productId:"a",observedAt:"2026-09-28T13:00:00.000Z",price:24500},
  {productId:"a",observedAt:"2026-09-28T15:00:00.000Z",price:23000}
];
assert.equal(latestPriceChange(unordered,"a").price,23000);
assert.equal(latestPriceChange([{productId:"a",observedAt:"invalid",price:1}],"a"),null);
assert.equal(latestPriceChange(changes,"missing"),null);
assert.equal(isTargetPriceReached(25000,30000),true);
assert.equal(isTargetPriceReached(35000,30000),false);
assert.equal(isTargetPriceReached(null,30000),false);
assert.equal(isTargetPriceReached(25000,0),false);
console.log("price tracker tests passed");
