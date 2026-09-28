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

const apparelHints = /(신생아|아기|베이비|유아|키즈|아동|주니어|바디수트|바디슈트|우주복|배냇|내복|상하복|티셔츠|맨투맨|블라우스|셔츠|바지|레깅스|원피스|가디건|아우터|점퍼|자켓|코트|의류)/i;
const rejectHints = /(크랭크|센서|자동차|차량용|부품|케이블|공구|휴대폰|케이스|골프|호텔|입장권|eSIM|이름표|장식판|벽 ?장식|아기방|사진 ?소품|기념품|완구|장난감|인형|식기|젖병|기저귀|물티슈|유모차|카시트|생일|돌잔치|백일|100일|배너|커튼|장식|자전거|타이어|라이딩|수납|파우치|압축팩|모피 ?칼라|트리밍|패브릭|봉제)/i;
const products = [...map.values()].filter(p =>
  apparelHints.test(p.name) && !rejectHints.test(p.name)
);
await fs.mkdir("data", { recursive: true });
await fs.writeFile("data/adpick-biz-products.json", JSON.stringify({
  source: "adpick_biz",
  syncedAt: new Date().toISOString(),
  queries,
  count: products.length,
  products
}, null, 2) + "\n");
console.log(`Saved ${products.length} unique ADPICK BIZ products`);
