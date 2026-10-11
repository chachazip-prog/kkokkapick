import type { AgeEvidence } from "./types";

// Port of src/product-domain.js. These exclusions are policy, not visual choices.
const CHILD =
  /(신생아|아기|영아|유아|키즈|아동|어린이|베이비|baby|toddler|kids)/i;
const EXCLUDE =
  /(반려|애완|강아지용|고양이용|견용|성인|어른|수집용|피규어|레진|DIY|원단|단추|인형\s*옷|완구\s*의류|장식|인테리어|프로젝터|야간\s*조명|수납|가구|다운로드|전자책|구독|랜덤|미스터리|식품|간식|젖병|기저귀|치발기|치아발육기|세척제|세정제|세탁용품|보관함)/i;
const FLOOR_COVERING =
  /(?:퍼즐|놀이|크롤링|층간\s*소음|바닥|조립|EVA\s*폼)\s*매트|카펫|카페트|바닥\s*(?:패드|타일|재)|퍼즐\s*타일|floor\s*(?:mat|tile|pad)|play\s*mat/i;
const GARMENT =
  /(내의|내복|상하복|상하세트|티셔츠|맨투맨|바디수트|우주복|배냇|원피스|카디건|가디건|윈드러너|바람막이|점퍼|자켓|팬츠|바지|레깅스|모자|수영복|leggings|cardigan|컬러\s*블[록럭]|썬블[록럭])/i;
const CANDIDATE =
  /(딸랑이|장난감|완구|보드북|그림책|촉감책|헝겊책|퍼즐|교구|쌓기\s*놀이|역할\s*놀이|소꿉\s*놀이|주방\s*놀이|양치\s*놀이|숫자놀이|모양맞추기|블[록럭])/i;

export function isFloorCovering(name: unknown): boolean {
  return FLOOR_COVERING.test(String(name || ""));
}

export function isLengthPricedFabric(name: unknown): boolean {
  const text = String(name || "");
  return (
    /원단|의류소재|재봉재료|\bfabric\b/i.test(text) &&
    /(?:\d+(?:\.\d+)?\s*(?:계량기|미터|야드|m|yards?)\s*(?:가격|단위\s*판매|당)|(?:미터|야드)\s*(?:당|단위\s*(?:가격|판매))|\bper\s*(?:met(?:er|re)|yard)\b)/i.test(
      text,
    )
  );
}

export function isNonApparelCandidate(name: unknown): boolean {
  const text = String(name || "");
  return !GARMENT.test(text) && CANDIDATE.test(text);
}

export function nonApparelDomain(name: unknown): "learning" | "toy" | null {
  const text = String(name || "");
  if (
    !isNonApparelCandidate(text) ||
    !CHILD.test(text) ||
    EXCLUDE.test(text) ||
    isFloorCovering(text)
  )
    return null;
  if (/(보드북|그림책|촉감책|헝겊책|퍼즐|교구|숫자놀이|모양맞추기)/i.test(text))
    return "learning";
  if (
    /(딸랑이|장난감|완구|쌓기\s*놀이|역할\s*놀이|소꿉\s*놀이|주방\s*놀이|양치\s*놀이|블[록럭])/i.test(
      text,
    )
  )
    return "toy";
  return null;
}

export function ageEvidence(
  name: unknown,
  raw: Record<string, unknown> = {},
): AgeEvidence | null {
  const explicit = raw.recommended_age;
  const text = typeof explicit === "string" ? explicit : String(name || "");
  const source = typeof explicit === "string" ? "provider" : "product_title";
  if (/사용\s*금지|권장하지|사용하지|세\s*미만/.test(text)) return null;
  const range = text.match(/(\d{1,3})\s*[–~\-]\s*(\d{1,3})\s*(개월|세)/);
  if (range) {
    const unit = range[3] === "세" ? 12 : 1;
    const min = Number(range[1]) * unit,
      max = Number(range[2]) * unit;
    if (min <= max && max <= 216)
      return {
        minMonths: min,
        maxMonths: max,
        source,
        sourceField: source === "provider" ? "recommended_age" : "title",
        rawText: range[0],
      };
  }
  const minimum = text.match(/(\d{1,3})\s*(개월|세)\s*이상/);
  if (minimum) {
    const min = Number(minimum[1]) * (minimum[2] === "세" ? 12 : 1);
    if (min <= 216)
      return {
        minMonths: min,
        maxMonths: null,
        source,
        sourceField: source === "provider" ? "recommended_age" : "title",
        rawText: minimum[0],
      };
  }
  return null;
}

export function isApparel(
  product: { domain?: unknown } | null | undefined,
): boolean {
  return !product?.domain || product.domain === "apparel";
}

export function matchesMonths(
  product: { ageEvidence?: AgeEvidence | null },
  months: unknown,
): boolean {
  const evidence = product.ageEvidence;
  const value =
    months === null || months === undefined || months === ""
      ? NaN
      : Number(months);
  return (
    !!evidence &&
    Number.isFinite(value) &&
    Number.isFinite(evidence.minMonths) &&
    value >= evidence.minMonths &&
    (evidence.maxMonths === null ||
      (Number.isFinite(evidence.maxMonths) && value <= evidence.maxMonths))
  );
}

export function isDiscoveryProduct(product: {
  name?: unknown;
  domain?: unknown;
}): boolean {
  return (
    !isLengthPricedFabric(product.name) &&
    (isApparel(product) || !isFloorCovering(product.name))
  );
}

export function stageForMonths(months: number): string {
  if (months < 4) return "신생아";
  if (months < 24) return "베이비";
  if (months < 48) return "유아";
  if (months < 72) return "토들러";
  return "키즈";
}

export function categoryOf(product: {
  name?: unknown;
  query?: unknown;
}): string {
  const text = String(product.query || "") + String(product.name || "");
  if (/바디수트|바디슈트|우주복/.test(text)) return "바디수트";
  if (/원피스/.test(text)) return "원피스";
  if (/가디건|아우터|점퍼|자켓|코트/.test(text)) return "아우터";
  if (/상하복|내복|내의|실내복/.test(text)) return "상하복";
  if (/티셔츠|맨투맨|셔츠/.test(text)) return "상의";
  if (/바지|레깅스/.test(text)) return "하의";
  return "기타";
}
