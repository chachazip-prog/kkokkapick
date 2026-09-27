import fs from "node:fs/promises";
import { AdpickBizProvider } from "../src/adpick-biz-provider.js";

const apiKey = process.env.ADPICK_BIZ_API_KEY;
if (!apiKey) throw new Error("Missing ADPICK_BIZ_API_KEY");

const queries = [
  "신생아 바디수트", "아기 내복", "아기 상하복", "아기 원피스", "아기 가디건",
  "유아 상하복", "유아 티셔츠", "유아 바지", "유아 원피스", "유아 아우터",
  "키즈 상하복", "키즈 티셔츠", "키즈 바지", "키즈 원피스", "키즈 아우터"
];

const provider = new AdpickBizProvider({ apiKey });
const map = new Map();
for (const q of queries) {
  const products = await provider.search(q, { limit: 20 });
  for (const p of products) {
    const key = p.externalProductId || p.affiliateUrl;
    if (!map.has(key)) map.set(key, p);
  }
  // Conservative pacing until the current account's documented quota is verified.
  await new Promise(r => setTimeout(r, 6500));
}

const products = [...map.values()];
await fs.mkdir("data", { recursive: true });
await fs.writeFile("data/adpick-biz-products.json", JSON.stringify({
  source: "adpick_biz",
  syncedAt: new Date().toISOString(),
  queries,
  count: products.length,
  products
}, null, 2) + "\n");
console.log(`Saved ${products.length} unique ADPICK BIZ products`);
