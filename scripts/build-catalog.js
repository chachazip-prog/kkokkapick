import fs from "node:fs/promises";
import { groupProducts } from "../src/product-grouper.js";\nimport { classifyProduct } from "../src/product-classifier.js";
const raw=JSON.parse(await fs.readFile("data/adpick-biz-products.json","utf8"));
const groups=groupProducts(raw.products||[]).map(classifyProduct);
await fs.writeFile("data/catalog.json",JSON.stringify({storagePolicy:raw.storagePolicy||"ttl_cache",syncedAt:raw.syncedAt,expiresAt:raw.expiresAt,sourceCount:(raw.products||[]).length,productCount:groups.length,products:groups},null,2)+"\n");
console.log(`Grouped ${raw.products.length} offers into ${groups.length} canonical products`);
