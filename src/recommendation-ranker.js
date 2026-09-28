function n(v,fallback=0){const x=Number(v);return Number.isFinite(x)?x:fallback}

export function recommendationScore(product={}, context={}) {
  let score=0;
  // Evidence quality: useful, but intentionally not dominant enough to hide most of the catalog.
  if(product.fitStatus==="verified") score+=18;
  else if(product.fitStatus==="candidate") score+=4;

  // Canonical brand recognition is a small data-quality signal, not a brand popularity claim.
  if(product.brand) score+=3;

  // More independent offers improve comparison utility.
  score+=Math.min(Math.max(n(product.offerCount,product.offers?.length||0)-1,0),4)*5;

  // Prefer products matching the child's broad stage when a profile exists.
  if(context.stage&&context.stage!=="전체"){
    if(product.stage===context.stage) score+=12;
    else if(context.stage==="토들러"&&(product.stage==="유아"||product.stage==="키즈")) score+=5;
  }

  // Small deterministic tie-breaker for products with a usable price.
  if(n(product.minPrice)>0) score+=1;
  return score;
}

export function compareRecommended(a,b,context={}) {
  const diff=recommendationScore(b,context)-recommendationScore(a,context);
  if(diff) return diff;
  const ao=n(a.offerCount,a.offers?.length||0), bo=n(b.offerCount,b.offers?.length||0);
  if(bo!==ao) return bo-ao;
  const ap=n(a.minPrice,Infinity), bp=n(b.minPrice,Infinity);
  if(ap!==bp) return ap-bp;
  return String(a.id||"").localeCompare(String(b.id||""));
}
