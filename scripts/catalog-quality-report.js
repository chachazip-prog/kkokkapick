import fs from "node:fs";

const catalog=JSON.parse(fs.readFileSync("data/catalog.json","utf8"));
const source=JSON.parse(fs.readFileSync("data/adpick-biz-products.json","utf8"));
const products=Array.isArray(catalog.products)?catalog.products:[];
const recognized=products.filter(p=>p.brand);
const guides=products.filter(p=>p.sizeGuide?.kind==="brand_official");
const explicitSizes=products.filter(p=>Array.isArray(p.availableSizes)&&p.availableSizes.length);
const multiImage=products.filter(p=>Array.isArray(p.imageUrls)&&new Set(p.imageUrls.filter(Boolean)).size>1);
const channelPrefix=/^\s*\[\s*(?:롯데백화점|현대백화점|신세계백화점|보리보리|롯데ON|롯데온|SSG|G마켓|옥션|11번가|GS\s*SHOP|GSSHOP|CJ온스타일|현대Hmall|현대홈쇼핑)\b/i;
const channelPrefixed=products.filter(p=>channelPrefix.test(String(p.name||"")));
const counts=(key)=>Object.entries(products.reduce((a,p)=>{const v=p[key]||"미분류";a[v]=(a[v]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]);
const pct=(n,d)=>d?Math.round(n/d*1000)/10:0;
const report={
  syncedAt:catalog.syncedAt||source.syncedAt||null,
  sourceProducts:source.count??source.products?.length??0,
  canonicalProducts:catalog.productCount??products.length,
  queries:source.queries?.length??0,
  recognizedBrandProducts:recognized.length,
  recognizedBrandRatePct:pct(recognized.length,products.length),
  officialBrandGuideProducts:guides.length,
  officialBrandGuideRatePct:pct(guides.length,products.length),
  explicitProductSizeProducts:explicitSizes.length,
  explicitProductSizeRatePct:pct(explicitSizes.length,products.length),
  multiImageProducts:multiImage.length,
  multiImageRatePct:pct(multiImage.length,products.length),
  channelPrefixedDisplayTitles:channelPrefixed.length,
  channelPrefixedDisplayTitleSamples:channelPrefixed.slice(0,10).map(p=>p.name),
  topBrands:counts("brand").slice(0,20).map(([name,count])=>({name,count})),
  categories:counts("category").map(([name,count])=>({name,count})),
  stages:counts("stage").map(([name,count])=>({name,count}))
};
console.log(JSON.stringify(report,null,2));
