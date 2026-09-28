const STOP = [
  "롯데백화점","현대백화점","신세계백화점","보리보리","해외","할인쿠폰",
  "무료배송","공식","국내공식","정품","신상품","택1","종택"
];
const VARIANT = /(\d+\s*(?:종|개|장|팩|세트|SET)|[0-9]+\+[0-9]+|컬러|색상)/i;

export function normalizeProductName(name="") {
  let s = String(name).normalize("NFKC").toLowerCase();
  for (const x of STOP) s=s.replaceAll(x.toLowerCase()," ");
  return s.replace(/\[[^\]]*\]|\([^)]*\)/g," ")
    .replace(/[+\/,_:·|~-]+/g," ")
    .replace(/\s+/g," ").trim();
}

function tokens(s){return new Set(normalizeProductName(s).split(" ").filter(x=>x.length>=2))}
function jaccard(a,b){const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;let i=0;for(const x of A)if(B.has(x))i++;return i/(A.size+B.size-i)}
function variantSignature(s){return (String(s).match(VARIANT)||[])[0]?.toLowerCase()||""}

export function groupProducts(rows) {
  const groups=[];
  for (const p of rows) {
    const norm=normalizeProductName(p.name);
    const variant=variantSignature(p.name);
    let best=null,bestScore=0;
    for (const g of groups) {
      if (variant && g.variant && variant!==g.variant) continue;
      const score=jaccard(norm,g.normalizedName);
      if(score>bestScore){best=g;bestScore=score}
    }
    if(best && bestScore>=0.82){
      best.offers.push(toOffer(p));
      if((p.name||"").length < best.name.length) best.name=p.name;
    } else {
      groups.push({
        id:p.externalProductId,
        name:p.name,
        normalizedName:norm,
        variant,
        imageUrl:p.imageUrl,
        category:p.cat||null,
        query:p.query||null,
        offers:[toOffer(p)]
      });
    }
  }
  return groups.map(g=>({
    ...g,
    offerCount:g.offers.length,
    minPrice:Math.min(...g.offers.map(o=>o.price||Infinity)),
    maxPrice:Math.max(...g.offers.map(o=>o.price||0))
  }));
}
function toOffer(p){return {merchant:p.merchant,merchantDomain:p.merchantDomain,price:p.price,originalPrice:p.originalPrice,affiliateUrl:p.affiliateUrl,externalProductId:p.externalProductId}}
