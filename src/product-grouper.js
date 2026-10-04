const CHANNELS = [
  "롯데백화점","현대백화점","신세계백화점","보리보리","롯데ON","롯데온",
  "SSG","G마켓","옥션","11번가","GS SHOP","GSSHOP","CJ온스타일","현대Hmall","현대홈쇼핑"
];
const NOISE = ["해외","할인쿠폰","무료배송","공식","국내공식","정품","신상품","택1","종택"];
const VARIANT = /(\d+\s*(?:종|개|장|팩|세트|SET)|[0-9]+\+[0-9]+|컬러|색상)/i;
const MODEL_CODE = /(?<![A-Z0-9])([A-Z0-9]{7,}(?:[-_][A-Z0-9]{2,})*)(?![A-Z0-9])/g;

function stripLeadingChannelTags(value="") {
  let s=String(value);
  let changed=true;
  while(changed){
    changed=false;
    const m=/^\s*\[\s*([^\]]+)\s*\]\s*/.exec(s);
    if(m&&CHANNELS.some(channel=>m[1].toLowerCase().includes(channel.toLowerCase()))){
      s=s.slice(m[0].length);changed=true;
    }
  }
  return s.replace(new RegExp(`^(?:${CHANNELS.map(escapeRegExp).join("|")})\\s*[-:|]?\\s*`,`i`),"");
}

function escapeRegExp(value){return value.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}

export function displayProductName(name="") {
  const original=String(name).normalize("NFKC").trim();
  const cleaned=stripLeadingChannelTags(original).replace(/\s+/g," ").trim();
  return cleaned||original;
}

export function normalizeProductName(name="") {
  let s=stripLeadingChannelTags(String(name).normalize("NFKC")).toLowerCase();
  for (const x of NOISE) s=s.replaceAll(x.toLowerCase()," ");
  // Keep bracket contents because they may contain brand/model identity such as [에뜨와].
  return s.replace(/[\[\]()]/g," ")
    .replace(/[+\/,_:·|~-]+/g," ")
    .replace(/\s+/g," ").trim();
}

function tokens(s){return new Set(normalizeProductName(s).split(" ").filter(x=>x.length>=2))}
function jaccard(a,b){const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;let i=0;for(const x of A)if(B.has(x))i++;return i/(A.size+B.size-i)}
function variantSignature(s){return (String(s).match(VARIANT)||[])[0]?.toLowerCase()||""}
function modelCode(s){return [...String(s).toUpperCase().matchAll(MODEL_CODE)].map(match=>match[1]).find(code=>/[A-Z]/.test(code)&&(code.match(/\d/g)||[]).length>=3)||""}
function validPrice(value){return Number.isFinite(value)&&value>0?value:null}
function validHttps(value){try{const u=new URL(value);return u.protocol==="https:"?u.toString():null}catch{return null}}

export function groupProducts(rows) {
  const groups=[];
  for (const p of rows) {
    const norm=normalizeProductName(p.name);
    if(!norm) continue;
    const displayName=displayProductName(p.name);
    const variant=variantSignature(p.name);
    const code=modelCode(p.name);
    let best=null,bestScore=0;
    for (const g of groups) {
      if (variant && g.variant && variant!==g.variant) continue;
      if (code && g.modelCode && code!==g.modelCode) continue;
      const score=jaccard(norm,g.normalizedName);
      if(score>bestScore){best=g;bestScore=score}
    }
    const strongCodeMatch=Boolean(code&&best?.modelCode&&code===best.modelCode);
    if(best && (strongCodeMatch||bestScore>=0.82)){
      best.offers.push(toOffer(p));
      const image=validHttps(p.imageUrl);
      if(image&&!best.imageUrls.includes(image))best.imageUrls.push(image);
      if(displayName.length < best.name.length) best.name=displayName;
    } else {
      const image=validHttps(p.imageUrl);
      groups.push({
        id:p.externalProductId,
        name:displayName,
        normalizedName:norm,
        variant,
        modelCode:code,
        imageUrl:image,
        imageUrls:image?[image]:[],
        category:p.cat||null,
        query:p.query||null,
        offers:[toOffer(p)]
      });
    }
  }
  return groups.map(g=>{
    const seen=new Set();
    g.offers=g.offers.filter(o=>{
      const key=(o.merchant||"")+"|"+(o.affiliateUrl||o.externalProductId||"");
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Retain seller provenance; conflicting compositions are never silently
    // collapsed into one product-wide material fact.
    const materials=[...new Set(g.offers.map(o=>o.material).filter(Boolean))];
    const availableSizes=[...new Set(g.offers.flatMap(o=>o.availableSizes||[]))];
    const productFactSources=g.offers.filter(o=>o.material||o.availableSizes?.length).map(o=>({provider:o.provider,merchant:o.merchant,externalProductId:o.externalProductId,checkedAt:o.checkedAt,material:o.material,availableSizes:o.availableSizes,fields:o.productFactFields}));
    const prices=g.offers.map(o=>o.price).filter(p=>p!=null);
    return {
      ...g,
      material:materials.length===1?materials[0]:null,
      materialConflict:materials.length>1,
      availableSizes,
      productFactSources,
      imageUrl:g.imageUrls[0]||null,
      offerCount:g.offers.length,
      minPrice:prices.length?Math.min(...prices):null,
      maxPrice:prices.length?Math.max(...prices):null
    };
  });
}
function toOffer(p){return {provider:p.provider,checkedAt:p.checkedAt,material:p.material||null,availableSizes:p.availableSizes||[],productFactFields:p.productFactFields||{},merchant:p.merchant,merchantDomain:p.merchantDomain,price:validPrice(p.price),originalPrice:validPrice(p.originalPrice),affiliateUrl:p.affiliateUrl,externalProductId:p.externalProductId}}
