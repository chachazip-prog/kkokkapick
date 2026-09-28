const SIZE_TOKEN = /(?:^|[^0-9])(60|70|75|80|85|90|95|100|105|110|120|130|140|150|160)(?:[^0-9]|$)/g;

export function extractSizes(text="") {
  const out=new Set();
  for(const m of String(text).matchAll(SIZE_TOKEN)) out.add(Number(m[1]));
  return [...out].sort((a,b)=>a-b);
}

export function evaluateFit(profile, product) {
  const months=Number(profile?.months);
  const height=Number(profile?.height);
  const weight=Number(profile?.weight);
  const sizes=product?.sizes?.length ? product.sizes : extractSizes(product?.name||"");

  if(!Number.isFinite(months) || !Number.isFinite(height) || !Number.isFinite(weight)) {
    return {status:"profile_required",label:"아이 정보가 더 필요해요",reason:"월령·키·몸무게를 입력하면 확인할 수 있어요"};
  }
  if(!sizes.length) {
    return {status:"insufficient_product_data",label:"사이즈 정보 확인 필요",reason:"판매처의 실제 사이즈 정보가 없어 추천하지 않았어요"};
  }

  // Numeric apparel sizes commonly track stature, but this is only a candidate
  // heuristic. Do not claim a recommendation without a verified size chart.
  return {
    status:"size_chart_required",
    label:"판매처 사이즈표 확인",
    reason:`상품에서 ${sizes.join(", ")} 사이즈를 확인했지만 브랜드 공식 사이즈표가 없어 특정 사이즈를 추천하지 않았어요`,
    availableSizes:sizes
  };
}
