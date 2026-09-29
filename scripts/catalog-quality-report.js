import fs from "node:fs";

const catalog=JSON.parse(fs.readFileSync("data/catalog.json","utf8"));
const source=JSON.parse(fs.readFileSync("data/adpick-biz-products.json","utf8"));
const products=Array.isArray(catalog.products)?catalog.products:[];
const recognized=products.filter(p=>p.brand);
const guides=products.filter(p=>p.sizeGuide?.kind==="brand_official");
const explicitSizes=products.filter(p=>Array.isArray(p.availableSizes)&&p.availableSizes.length);
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
  topBrands:counts("brand").slice(0,20).map(([name,count])=>({name,count})),
  categories:counts("category").map(([name,count])=>({name,count})),
  stages:counts("stage").map(([name,count])=>({name,count}))
};
console.log(JSON.stringify(report,null,2));
