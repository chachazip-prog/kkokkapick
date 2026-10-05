import path from "node:path";
import { classifyCatalogRelevance } from "../src/apparel-relevance.js";
import { catalogCacheWindow } from "../src/provider-product-facts.js";
import fs from "node:fs/promises";
import { groupProducts } from "../src/product-grouper.js";
import { classifyProduct } from "../src/product-classifier.js";
import { buildPriceChanges } from "../src/price-tracker.js";

const dataFile=name=>path.join(process.env.CATALOG_DATA_DIR || "data",name);
const raw=JSON.parse(await fs.readFile(dataFile("adpick-biz-products.json"),"utf8"));
let previous={products:[]};
try { previous=JSON.parse(await fs.readFile(dataFile("catalog.json"),"utf8")); } catch {}
let history={version:1,events:[]};
try { history=JSON.parse(await fs.readFile(dataFile("price-history.json"),"utf8")); } catch {}

const groups=groupProducts((raw.products||[]).filter(p => classifyCatalogRelevance(p).eligible).map(p => ({...p,domain:classifyCatalogRelevance(p).domain}))).map(classifyProduct).filter(p => Boolean(p.imageUrl) || p.imageUrls?.length);
const now=raw.syncedAt||new Date().toISOString();
const identityCorrected=previous.groupingVersion!==2;
const changes=identityCorrected?[]:buildPriceChanges(previous.products||[],groups,now);

// Demo-only bounded history. Do not treat this as permission for indefinite
// provider-derived retention; production retention follows verified provider terms.
history={
  version:1,
  groupingVersion:2,
  identityCorrection:identityCorrected?"discarded_legacy_ambiguous_product_groups":history.identityCorrection,
  updatedAt:now,
  retention:"bounded_demo_events",
  events:[...(identityCorrected?[]:history.events||[]),...changes].slice(-1000)
};
await fs.writeFile(dataFile("price-history.json"),JSON.stringify(history,null,2)+"\n");

await fs.writeFile(
  dataFile("catalog.json"),
  JSON.stringify({
    groupingVersion:2,
    storagePolicy:raw.storagePolicy||"ttl_cache",
    syncedAt:raw.syncedAt,
    expiresAt:raw.expiresAt || catalogCacheWindow(now).expiresAt,
    sourceCount:(raw.products||[]).length,
    productCount:groups.length,
    priceChangeCount:changes.length,
    products:groups
  },null,2)+"\n"
);

console.log(`Grouped ${raw.products.length} offers into ${groups.length} canonical products; ${changes.length} price changes`);
