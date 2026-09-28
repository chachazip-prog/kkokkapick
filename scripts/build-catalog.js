import fs from "node:fs/promises";
import { groupProducts } from "../src/product-grouper.js";
import { classifyProduct } from "../src/product-classifier.js";

const raw=JSON.parse(await fs.readFile("data/adpick-biz-products.json","utf8"));
let previous={products:[]};
try { previous=JSON.parse(await fs.readFile("data/catalog.json","utf8")); } catch {}
let history={version:1,events:[]};
try { history=JSON.parse(await fs.readFile("data/price-history.json","utf8")); } catch {}

const groups=groupProducts(raw.products||[]).map(classifyProduct);
const oldPrice=new Map((previous.products||[]).map(p=>[String(p.id),Number(p.minPrice)||null]));
const now=raw.syncedAt||new Date().toISOString();
const changes=[];

for(const p of groups){
  const id=String(p.id);
  const before=oldPrice.get(id);
  const after=Number(p.minPrice)||null;
  if(before!=null && after!=null && before!==after){
    changes.push({
      productId:id,
      observedAt:now,
      previousPrice:before,
      price:after,
      direction:after<before?"down":"up",
      changeAmount:after-before
    });
  }
}

// Demo-only bounded history. Do not treat this as permission for indefinite
// provider-derived retention; production retention follows verified provider terms.
history={
  version:1,
  updatedAt:now,
  retention:"bounded_demo_events",
  events:[...(history.events||[]),...changes].slice(-1000)
};
await fs.writeFile("data/price-history.json",JSON.stringify(history,null,2)+"\n");

await fs.writeFile(
  "data/catalog.json",
  JSON.stringify({
    storagePolicy:raw.storagePolicy||"ttl_cache",
    syncedAt:raw.syncedAt,
    expiresAt:raw.expiresAt,
    sourceCount:(raw.products||[]).length,
    productCount:groups.length,
    priceChangeCount:changes.length,
    products:groups
  },null,2)+"\n"
);

console.log(`Grouped ${raw.products.length} offers into ${groups.length} canonical products; ${changes.length} price changes`);
