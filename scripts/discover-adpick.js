import fs from "node:fs/promises";
import { AdpickBizProvider } from "../src/adpick-biz-provider.js";
import { ADPICK_DISCOVERY_QUERIES as queries, ADPICK_SEARCH_LIMIT, ADPICK_DISCOVERY_PACING_MS } from "../src/adpick-discovery-plan.js";

const apiKey = process.env.ADPICK_BIZ_API_KEY;
if (!apiKey) throw new Error("Missing ADPICK_BIZ_API_KEY");

const provider = new AdpickBizProvider({ apiKey });
const map = new Map();
for (const q of queries) {
  const products = await provider.search(q, { limit: ADPICK_SEARCH_LIMIT });
  for (const p of products) {
    const key = p.externalProductId || p.affiliateUrl;
    if (!map.has(key)) map.set(key, p);
  }
  // Conservative pacing until the current account's documented quota is verified.
  await new Promise(r => setTimeout(r, ADPICK_DISCOVERY_PACING_MS));
}

const apparelHints = /(신생아|아기|베이비|유아|키즈|아동|주니어|바디수트|바디슈트|우주복|배냇|내복|상하복|티셔츠|맨투맨|블라우스|셔츠|바지|레깅스|원피스|가디건|아우터|점퍼|자켓|코트|의류)/i;
const rejectHints = /(크랭크|센서|자동차|차량용|부품|케이블|공구|휴대폰|케이스|골프|호텔|입장권|eSIM|이름표|장식판|벽 ?장식|아기방|사진 ?소품|기념품|완구|장난감|인형|식기|젖병|기저귀|물티슈|유모차|카시트|생일|돌잔치|백일|100일|배너|커튼|장식|자전거|타이어|라이딩|수납|파우치|압축팩|모피 ?칼라|트리밍|패브릭|봉제|욕조|앞치마|에이프런|물병|물통|옷걸이|소파|의자|수유일지|침대|반려동물|애완동물|강아지|고양이|금형|폴더|보관|이불|토퍼|우비|레인코트|베이비 ?모니터|모니터|가방고리|키링|남성|성인|버튼|액세서리)/i;
const adultMaleOnly = name => /남자/.test(name) && !/(남자\s*아기|남아|유아|아동|키즈|주니어)/.test(name);
const products = [...map.values()].filter(p =>
  apparelHints.test(p.name) && !rejectHints.test(p.name) && !adultMaleOnly(p.name)
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
