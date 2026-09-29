const fs=require('fs');
const raw=JSON.parse(fs.readFileSync('data/catalog.json','utf8'));
const items=Array.isArray(raw)?raw:(raw.products||raw.items||[]);
const nonEmpty=v=>typeof v==='string'&&v.trim().length>0;
const httpImage=p=>{const u=p.imageUrl||p.image_url||p.photo;return nonEmpty(u)&&/^https:\/\//.test(u)};
const withImage=items.filter(httpImage).length;
const withPrice=items.filter(p=>Number.isFinite(p.minPrice??p.min_price)&&Number(p.minPrice??p.min_price)>0).length;
const withBrand=items.filter(p=>nonEmpty(p.brand)).length;
const verifiedFit=items.filter(p=>(p.fitStatus??p.fit_status)==='verified').length;
const report={generatedAt:new Date().toISOString(),total:items.length,httpsImageUrls:withImage,imageUrlCoverage:items.length?withImage/items.length:0,priced:withPrice,priceCoverage:items.length?withPrice/items.length:0,branded:withBrand,brandCoverage:items.length?withBrand/items.length:0,verifiedFit,verifiedFitCoverage:items.length?verifiedFit/items.length:0};
console.log(JSON.stringify(report,null,2));
if(items.length&&report.imageUrlCoverage<0.9){console.error('catalog image URL coverage below 90%');process.exit(1)}
