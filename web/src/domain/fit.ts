import { isApparel } from "./product-domain";
import type { SizeGuideRow } from "./types";

export interface VerifiedBrandChart {
  source: string;
  verified: true;
  verifiedAt: string;
  rows: SizeGuideRow[];
}

// Exact evidence and rows from src/brand-size-charts.js; no new brand promotion.
export const BRAND_SIZE_CHARTS: Readonly<Record<string, VerifiedBrandChart>> = {
  에뜨와: {
    source: "official_ettoimall_brand_size_guide",
    verified: true,
    verifiedAt: "2026-09-28",
    rows: [
      { size: "70", months: [0, 3], height: 64, weight: null },
      { size: "75", months: [3, 6], height: 70, weight: null },
      { size: "80", months: [6, 12], height: 74, weight: null },
      { size: "90", months: [12, 24], height: 80, weight: null },
      { size: "100", months: [24, 36], height: 87, weight: null },
      { size: "3Y", months: [36, 48], height: 95, weight: null },
      { size: "4Y", months: [36, 48], height: 105, weight: null },
    ],
  },
  아가방: {
    source: "official_brand_size_guide",
    verified: true,
    verifiedAt: "2026-09-28",
    rows: [
      { size: "1M", months: [1, 1], height: 48, weight: 5.1 },
      { size: "3M", months: [3, 3], height: 54, weight: 7.2 },
      { size: "60", months: [3, 6], height: 60, weight: 8.4 },
      { size: "9M", months: [6, 9], height: 68, weight: 9.5 },
      { size: "75", months: [7, 10], height: 72, weight: 10.3 },
      { size: "80", months: [9, 12], height: 76, weight: null },
      { size: "90", months: [12, 24], height: 84, weight: 12.8 },
      { size: "100", months: [36, 36], height: 92, weight: 13.7 },
      { size: "110", months: [48, 48], height: 101, weight: 15.7 },
      { size: "120", months: [60, 60], height: 110, weight: 19.7 },
      { size: "130", months: [72, 72], height: 119, weight: 23.6 },
    ],
  },
};

export interface FitProfile {
  months?: unknown;
  height?: unknown;
  weight?: unknown;
}
export type FitResult =
  | { status: "not_applicable"; label: string }
  | {
      status: "profile_required" | "insufficient_product_data";
      label: string;
      reason: string;
    }
  | {
      status: "recommended";
      label: string;
      recommendedSize: string;
      brand: string;
      source: string;
      reason: string;
    };

export function detectBrand(name: unknown = ""): string | null {
  const text = String(name || "");
  if (/(?:아가방|AGABANG)/i.test(text)) return "아가방";
  if (/(?:에뜨와(?:HB)?|ETTOI)/i.test(text)) return "에뜨와";
  return null;
}

export function getVerifiedChart(
  brand: string | null | undefined,
): VerifiedBrandChart | null {
  const chart = brand ? BRAND_SIZE_CHARTS[brand] : null;
  return chart?.verified && chart.source && chart.verifiedAt ? chart : null;
}

export function positiveNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

/** Web behavior accepts newborn month 0; a title's numeric size never participates. */
export function evaluateFit(
  profile: FitProfile | null | undefined,
  product: { name?: unknown; brand?: string | null; domain?: unknown },
): FitResult {
  if (!isApparel(product))
    return { status: "not_applicable", label: "의류 전용 사이즈 안내" };
  const rawMonths = profile?.months;
  const months =
    rawMonths !== null &&
    rawMonths !== undefined &&
    rawMonths !== "" &&
    Number.isFinite(Number(rawMonths)) &&
    Number(rawMonths) >= 0
      ? Number(rawMonths)
      : null;
  const height = positiveNumber(profile?.height),
    weight = positiveNumber(profile?.weight);
  if (months === null || height === null || weight === null)
    return {
      status: "profile_required",
      label: "아이 정보가 더 필요해요",
      reason: "월령·키·몸무게를 입력하면 확인할 수 있어요",
    };
  const brand = product.brand || detectBrand(product.name);
  const chart = getVerifiedChart(brand);
  if (!chart || !brand)
    return {
      status: "insufficient_product_data",
      label: "사이즈 정보 확인 필요",
      reason: "검증된 브랜드 사이즈표가 없어 추천하지 않았어요",
    };
  const ranked = chart.rows
    .map((row) => {
      let score = Math.abs(height - (row.height ?? 0));
      if (row.weight !== null) score += Math.abs(weight - row.weight) * 1.5;
      if (row.months) {
        const [lo, hi] = row.months;
        if (months < lo) score += (lo - months) * 0.6;
        if (months > hi) score += (months - hi) * 0.6;
      }
      return { row, score };
    })
    .sort((a, b) => a.score - b.score);
  const best = ranked[0]?.row;
  if (!best)
    return {
      status: "insufficient_product_data",
      label: "사이즈 정보 확인 필요",
      reason: "적용 가능한 공식 사이즈 정보가 없어요",
    };
  return {
    status: "recommended",
    label: `${best.size} 우선 확인`,
    recommendedSize: best.size,
    brand,
    source: chart.source,
    reason: `${brand} 공식 권장 사이즈표의 연령·신장·몸무게 기준과 비교한 결과예요. 실제 상품 옵션과 체형에 따라 달라질 수 있어요`,
  };
}
