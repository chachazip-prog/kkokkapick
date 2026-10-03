import { detectBrand, getVerifiedChart } from "./brand-size-charts.js";

const SIZE_TOKEN = /(^|[^0-9])(60|70|75|80|85|90|95|100|105|110|120|130|140|150|160)(?=$|[^0-9])/g;

export function extractSizes(text="") {
  const out=new Set();
  for(const m of String(text).matchAll(SIZE_TOKEN)) out.add(Number(m[2]));
  return [...out].sort((a,b)=>a-b);
}

function score(row, months, height, weight) {
  let s=Math.abs(height-row.height);
  if(row.weight!=null) s+=Math.abs(weight-row.weight)*1.5;
  const [lo,hi]=row.months;
  if(months<lo) s+=(lo-months)*0.6;
  if(months>hi) s+=(months-hi)*0.6;
  return s;
}

function positiveNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function evaluateFit(profile, product) {
  const months=positiveNumber(profile?.months), height=positiveNumber(profile?.height), weight=positiveNumber(profile?.weight);
  if(months===null||height===null||weight===null)
    return {status:"profile_required",label:"아이 정보가 더 필요해요",reason:"월령·키·몸무게를 입력하면 확인할 수 있어요"};

  const brand=product?.brand||detectBrand(product?.name||"");
  const chart=getVerifiedChart(brand);
  if(!chart)
    return {status:"insufficient_product_data",label:"사이즈 정보 확인 필요",reason:"검증된 브랜드 사이즈표가 없어 추천하지 않았어요"};

  const ranked=chart.rows.map(r=>({row:r,score:score(r,months,height,weight)})).sort((a,b)=>a.score-b.score);
  const best=ranked[0]?.row;
  if(!best) return {status:"insufficient_product_data",label:"사이즈 정보 확인 필요",reason:"적용 가능한 공식 사이즈 정보가 없어요"};

  return {
    status:"recommended",
    label:`${best.size} 우선 확인`,
    recommendedSize:best.size,
    brand,
    reason:`${brand} 공식 권장 사이즈표의 연령·신장·몸무게 기준과 비교한 결과예요. 실제 상품 옵션과 체형에 따라 달라질 수 있어요`,
    source:chart.source
  };
}
