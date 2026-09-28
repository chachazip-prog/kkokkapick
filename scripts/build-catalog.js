import fs from "node:fs/promises";
import { groupProducts } from "../src/product-grouper.js";
const raw=JSON.parse(await fs.readFile("data/adpick-biz-products.json","utf8"));
const groups=groupProducts(raw.products||[]);
await fs.writeFile("data/catalog.json",JSON.stringify({syncedAt:raw.syncedAt,sourceCount:(raw.products||[]).length,productCount:groups.length,products:groups},null,2)+"\n");
console.log(`Grouped ${raw.products.length} offers into ${groups.length} canonical products`);
