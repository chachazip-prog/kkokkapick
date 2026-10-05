export const PRODUCT_CONTRACT_VERSION = 1;

const MERCHANT_CHANNEL_PREFIXES=[
  "보리보리","롯데백화점","롯데ON","롯데온","SSG","G마켓","옥션","11번가",
  "GS SHOP","GSSHOP","CJ온스타일","현대Hmall","현대홈쇼핑"
];

export function normalizeProductDisplayName(name){
  const original=String(name||"");
  let value=original.trim();
  let changed=true;
  while(changed){
    changed=false;
    const match=value.match(/^\s*\[\s*([^\]]+)\s*\]\s*/);
    if(match&&MERCHANT_CHANNEL_PREFIXES.some(channel=>match[1].toLowerCase().includes(channel.toLowerCase()))){
      value=value.slice(match[0].length);
      changed=true;
    }
  }
  const escaped=MERCHANT_CHANNEL_PREFIXES.map(v=>v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  value=value.replace(new RegExp(`^(?:${escaped.join("|")})\\s*[-:|]?\\s*`,"i"),"");
  const normalized=value.trim();
  return normalized||original;
}

export function toClientProduct(product={}) {
  const offers=(product.offers||[]).map(toClientOffer).filter(o=>o.affiliateUrl);
  const prices=offers.map(o=>o.price).filter(Number.isFinite);
  const name=String(product.name||"");
  return {
    id:String(product.id||""),
    name,
    displayName:normalizeProductDisplayName(name),
    domain:product.domain||"apparel",
    ageEvidence:product.ageEvidence||null,
    material:product.material||null,
    imageUrls:Array.isArray(product.imageUrls)?product.imageUrls:[],
    brand:product.brand||null,
    category:product.category||"기타",
    stage:product.stage||null,
    imageUrl:product.imageUrl||null,
    fitStatus:["verified","candidate","unverified"].includes(product.fitStatus)?product.fitStatus:"unverified",
    fitSource:product.fitSource||null,
    sizeGuide:normalizeSizeGuide(product.sizeGuide),
    availableSizes:Array.isArray(product.availableSizes)?product.availableSizes.map(String).filter(Boolean):[],
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

function normalizeSizeGuide(guide){
  if(!guide||guide.kind!=="brand_official"||!Array.isArray(guide.rows)) return null;
  return {kind:"brand_official",source:guide.source||null,verifiedAt:guide.verifiedAt||null,rows:guide.rows.map(r=>({size:String(r.size||""),months:Array.isArray(r.months)?r.months:null,height:nullableNumber(r.height),weight:nullableNumber(r.weight)})).filter(r=>r.size)};
}
