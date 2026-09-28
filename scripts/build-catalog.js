import fs from "node:fs/promises";
import { groupProducts } from "../src/product-grouper.js";
import { classifyProduct } from "../src/product-classifier.js";
import { buildPriceChanges } from "../src/price-tracker.js";

const raw=JSON.parse(await fs.readFile("data/adpick-biz-products.json","utf8"));
let previous={products:[]};
try { previous=JSON.parse(await fs.readFile("data/catalog.json","utf8")); } catch {}
let history={version:1,events:[]};
try { history=JSON.parse(await fs.readFile("data/price-history.json","utf8")); } catch {}

const groups=groupProducts(raw.products||[]).map(classifyProduct);
const now=raw.syncedAt||new Date().toISOString();
const changes=buildPriceChanges(previous.products||[],groups,now);

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
