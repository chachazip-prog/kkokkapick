import { normalizeBrand } from "./brand-normalizer.js";
import { getFitEvidence } from "./brand-size-charts.js";

const RULES = [
  ["바디수트", /(바디수트|바디슈트|우주복|배냇)/i],
  ["실내복", /(내복|내의|실내복|잠옷|파자마)/i],
  ["상하복", /(상하복|상하세트|상하 세트|셋업)/i],
  ["원피스", /(원피스|드레스|피나포어)/i],
  ["아우터", /(가디건|아우터|점퍼|재킷|자켓|코트|패딩|바람막이|베스트)/i],
  ["하의", /(바지|팬츠|레깅스|청바지|스커트|치마)/i],
  ["상의", /(티셔츠|티셔츠|맨투맨|후드|블라우스|셔츠|니트|스웨터)/i],
  ["수영복", /(수영복|래쉬가드|래시가드)/i],
  ["한복", /(한복|생활한복)/i]
];

export function classifyCategory(name="", query="") {
  const s=name+" "+query;
  for(const [category,re] of RULES) if(re.test(s)) return category;
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
  const brand=normalizeBrand(p.name);
  const fit=getFitEvidence(brand);
  return {...p, brand, fitStatus:fit.status, fitSource:fit.source, category:classifyCategory(p.name,p.query), stage:classifyStage(p.name,p.query)};
}
