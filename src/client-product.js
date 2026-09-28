export const PRODUCT_CONTRACT_VERSION = 1;

export function toClientProduct(product={}) {
  const offers=(product.offers||[]).map(toClientOffer).filter(o=>o.affiliateUrl);
  const prices=offers.map(o=>o.price).filter(Number.isFinite);
  return {
    id:String(product.id||""),
    name:String(product.name||""),
    brand:product.brand||null,
    category:product.category||"기타",
    stage:product.stage||null,
    imageUrl:product.imageUrl||null,
    fitStatus:["verified","candidate","unverified"].includes(product.fitStatus)?product.fitStatus:"unverified",
    fitSource:product.fitSource||null,
    minPrice:prices.length?Math.min(...prices):nullableNumber(product.minPrice),
    maxPrice:prices.length?Math.max(...prices):nullableNumber(product.maxPrice),
    offerCount:offers.length,
    offers
  };
}

export function toClientOffer(offer={}) {
  return {
    merchant:String(offer.merchant||"판매처"),
    price:nullableNumber(offer.price),
    originalPrice:nullableNumber(offer.originalPrice),
    affiliateUrl:String(offer.affiliateUrl||""),
    provider:offer.provider||null,
    updatedAt:offer.updatedAt||null
  };
}

function nullableNumber(v){
  if(v===null||v===undefined||v==="") return null;
  const n=Number(v);
  return Number.isFinite(n)&&n>=0?n:null;
}
