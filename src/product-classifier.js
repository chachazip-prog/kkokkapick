import domains from './product-domain.js';
import { normalizeBrand } from "./brand-normalizer.js";
import { getFitEvidence, getBrandSizeGuide } from "./brand-size-charts.js";

const RULES = [
  ["신발", /(고무신|운동화|구두|샌들|장화)/i],
  ["수영복", /(수영복|래쉬가드|래시가드|스윔)/i],
  ["한복", /(한복|생활한복)/i],
  ["바디수트", /(바디수트|바디슈트|우주복|배냇|롬퍼|점프수트|점프슈트)/i],
  ["실내복", /(내복|내의|실내복|잠옷|파자마|수면조끼)/i],
  ["상하복", /(상하복|상하세트|상하 세트|셋업|상하의|스웻상하|트랙슈트|트레이닝복)/i],
  ["원피스", /(원피스|드레스|피나포어|\bOPS\b)/i],
  ["아우터", /(가디건|카디건|조끼|다운|아우터|점퍼|재킷|자켓|코트|패딩|바람막이|베스트|우비|레인코트)/i],
  ["하의", /(바지|팬츠|레깅스|청바지|스커트|치마)/i],
  ["상의", /(티셔츠|티셔츠|맨투맨|후드|후디|블라우스|셔츠|니트|스웨터|풀오버|크롭티|트랙 ?탑|져지|저지)/i],
  ["패션잡화", /(헤어밴드|머리띠|터번|모자|양말)/i]
];

export function classifyCategory(name="", query="") {
  for (const text of [name, query]) {
    for (const [category, re] of RULES) if (re.test(text)) return category;
  }
  return "기타";
}

export function classifyStage(name="", query="") {
  const s=(name+" "+query).toLowerCase();
  if(/신생아|배냇|newborn/.test(s)) return "신생아";
  if(/베이비|아기|baby/.test(s)) return "베이비";
  if(/토들러|toddler/.test(s)) return "토들러";
  if(/키즈|아동|주니어|kids|junior/.test(s)) return "키즈";
  if(/유아/.test(s)) return "유아";
  return "전체";
}

export function classifyProduct(p) {
  if(p.domain && p.domain!=="apparel") return {...p,brand:null,category:domains.category(p.domain,p.name),stage:"전체",ageEvidence:nonApparelAge(p),fitStatus:"unverified",fitSource:null,sizeGuide:null,availableSizes:[]};
  const brand=normalizeBrand(p.name);
  const fit=getFitEvidence(brand);
  return {...p, brand, fitStatus:fit.status, fitSource:fit.source, sizeGuide:getBrandSizeGuide(brand), availableSizes:Array.isArray(p.availableSizes)?p.availableSizes:[], category:classifyCategory(p.name,p.query), stage:classifyStage(p.name,p.query)};
}

function nonApparelAge(p){const evidence=(p.offers||[]).map(o=>o.ageEvidence).filter(Boolean);const unique=[...new Map(evidence.map(e=>[JSON.stringify(e),e])).values()];return unique.length===1?unique[0]:unique.length>1?null:domains.ageEvidence(p.name,p);}
