import { isRecord, nullableNumber, stringOrNull } from "./types";
import type {
  AgeEvidence,
  ClientOffer,
  ClientProduct,
  SizeGuide,
} from "./types";

export const PRODUCT_CONTRACT_VERSION = 1;
const MERCHANT_CHANNEL_PREFIXES = [
  "보리보리",
  "롯데백화점",
  "롯데ON",
  "롯데온",
  "SSG",
  "G마켓",
  "옥션",
  "11번가",
  "GS SHOP",
  "GSSHOP",
  "CJ온스타일",
  "현대Hmall",
  "현대홈쇼핑",
];
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Shared client contract cleanup; the source name is preserved on the product. */
export function normalizeProductDisplayName(name: unknown): string {
  const original = String(name || "");
  let value = original.trim(),
    changed = true;
  while (changed) {
    changed = false;
    const match = value.match(/^\s*\[\s*([^\]]+)\s*\]\s*/);
    if (
      match &&
      MERCHANT_CHANNEL_PREFIXES.some((channel) =>
        match[1].toLowerCase().includes(channel.toLowerCase()),
      )
    ) {
      value = value.slice(match[0].length);
      changed = true;
    }
  }
  value = value.replace(
    new RegExp(
      `^(?:${MERCHANT_CHANNEL_PREFIXES.map(escapeRegExp).join("|")})\\s*[-:|]?\\s*`,
      "i",
    ),
    "",
  );
  return value.trim() || original;
}

/** Existing web card cleanup only. Never use this derived label as identity/evidence. */
export function cleanProductName(product: {
  name?: unknown;
  brand?: unknown;
}): string {
  const original = String(product.name || "");
  let name = original
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\((?:[A-Z][A-Z/ _-]*|\d{5,})\)/g, " ")
    .replace(/[_\s]?[A-Z0-9]*\d[A-Z0-9]{7,}\b/g, " ")
    .trim();
  if (typeof product.brand === "string" && product.brand)
    name = name.replace(
      new RegExp(`^(?:${escapeRegExp(product.brand)}\\s*)+`, "i"),
      "",
    );
  return (
    name
      .replace(/\(모자\)/g, " + 모자 세트")
      .replace(/아양우주복/g, "아양 우주복")
      .replace(/\s+/g, " ")
      .trim() || original
  );
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : [];
}

function scalarText(value: unknown, fallback = ""): string {
  return typeof value === "string" && value
    ? value
    : typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : fallback;
}
function saleSizes(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => scalarText(item)).filter(Boolean)
    : [];
}

function normalizeAgeEvidence(value: unknown): AgeEvidence | null {
  if (
    !isRecord(value) ||
    typeof value.minMonths !== "number" ||
    !Number.isFinite(value.minMonths) ||
    value.minMonths < 0 ||
    value.minMonths > 216 ||
    !(
      value.maxMonths === null ||
      (typeof value.maxMonths === "number" &&
        Number.isFinite(value.maxMonths) &&
        value.maxMonths >= value.minMonths &&
        value.maxMonths <= 216)
    )
  )
    return null;
  if (
    typeof value.source !== "string" ||
    !["provider", "product_title"].includes(value.source) ||
    typeof value.sourceField !== "string" ||
    !["recommended_age", "title"].includes(value.sourceField) ||
    typeof value.rawText !== "string"
  )
    return null;
  return {
    minMonths: value.minMonths,
    maxMonths: value.maxMonths as number | null,
    source: value.source as AgeEvidence["source"],
    sourceField: value.sourceField as AgeEvidence["sourceField"],
    rawText: value.rawText,
  };
}

function normalizeSizeGuide(value: unknown): SizeGuide | null {
  if (
    !isRecord(value) ||
    value.kind !== "brand_official" ||
    !Array.isArray(value.rows)
  )
    return null;
  return {
    kind: "brand_official",
    source: stringOrNull(value.source),
    verifiedAt: stringOrNull(value.verifiedAt),
    rows: value.rows
      .filter(isRecord)
      .map((row) => ({
        size: scalarText(row.size),
        months:
          Array.isArray(row.months) &&
          row.months.length === 2 &&
          row.months.every(
            (month) => typeof month === "number" && Number.isFinite(month),
          )
            ? (row.months as [number, number])
            : null,
        height: nullableNumber(row.height),
        weight: nullableNumber(row.weight),
      }))
      .filter((row) => row.size),
  };
}

export function toClientOffer(input: unknown = {}): ClientOffer {
  const offer = isRecord(input) ? input : {};
  return {
    ...offer,
    merchant: scalarText(offer.merchant, "판매처"),
    price: nullableNumber(offer.price),
    originalPrice: nullableNumber(offer.originalPrice),
    affiliateUrl: scalarText(offer.affiliateUrl),
    provider: stringOrNull(offer.provider),
    updatedAt: stringOrNull(offer.updatedAt),
    checkedAt: stringOrNull(offer.checkedAt),
    material: stringOrNull(offer.material),
    availableSizes: saleSizes(offer.availableSizes),
    productFactFields: isRecord(offer.productFactFields)
      ? { ...offer.productFactFields }
      : {},
    externalProductId: stringOrNull(offer.externalProductId),
  };
}

export function toClientProduct(input: unknown = {}): ClientProduct {
  const product = isRecord(input) ? input : {};
  const offers = (Array.isArray(product.offers) ? product.offers : [])
    .map(toClientOffer)
    .filter((offer) => offer.affiliateUrl);
  const prices = offers
    .map((offer) => offer.price)
    .filter(
      (price): price is number => price !== null && Number.isFinite(price),
    );
  const name = scalarText(product.name);
  return {
    ...product,
    id: scalarText(product.id),
    name,
    displayName: normalizeProductDisplayName(name),
    domain: stringOrNull(product.domain) || "apparel",
    ageEvidence: normalizeAgeEvidence(product.ageEvidence),
    material: stringOrNull(product.material),
    materialConflict: Boolean(product.materialConflict),
    imageUrls: strings(product.imageUrls),
    brand: stringOrNull(product.brand),
    category: stringOrNull(product.category) || "기타",
    stage: stringOrNull(product.stage),
    imageUrl: stringOrNull(product.imageUrl),
    fitStatus:
      product.fitStatus === "verified" || product.fitStatus === "candidate"
        ? product.fitStatus
        : "unverified",
    fitSource: stringOrNull(product.fitSource),
    sizeGuide: normalizeSizeGuide(product.sizeGuide),
    availableSizes: saleSizes(product.availableSizes),
    minPrice: prices.length
      ? Math.min(...prices)
      : nullableNumber(product.minPrice),
    maxPrice: prices.length
      ? Math.max(...prices)
      : nullableNumber(product.maxPrice),
    offerCount: offers.length,
    offers,
  };
}

export type ProductFact =
  | { status: "provided"; value: string }
  | { status: "unknown"; value: null }
  | { status: "conflicting"; value: null };

export function materialFact(product: ClientProduct): ProductFact {
  if (product.materialConflict) return { status: "conflicting", value: null };
  return product.material
    ? { status: "provided", value: product.material }
    : { status: "unknown", value: null };
}

export function availableSizeFact(product: ClientProduct): ProductFact {
  return product.availableSizes.length
    ? { status: "provided", value: product.availableSizes.join(", ") }
    : { status: "unknown", value: null };
}

export function safeDestination(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? value : null;
  } catch {
    return null;
  }
}
