/** Published client facts. Unknown values are never inferred from a title or chart. */
export type FitEvidenceStatus = "verified" | "candidate" | "unverified";
export type ProductDomain = "apparel" | "toy" | "learning" | (string & {});

export interface AgeEvidence {
  minMonths: number;
  maxMonths: number | null;
  source: "provider" | "product_title";
  sourceField: "recommended_age" | "title";
  rawText: string;
}

export interface SizeGuideRow {
  size: string;
  months: [number, number] | null;
  height: number | null;
  weight: number | null;
}

export interface SizeGuide {
  kind: "brand_official";
  source: string | null;
  verifiedAt: string | null;
  rows: SizeGuideRow[];
}

export interface ClientOffer {
  merchant: string;
  price: number | null;
  originalPrice: number | null;
  affiliateUrl: string;
  provider: string | null;
  updatedAt: string | null;
  checkedAt: string | null;
  material: string | null;
  availableSizes: string[];
  productFactFields: Record<string, unknown>;
  externalProductId: string | null;
  [sourceField: string]: unknown;
}

export interface ClientProduct {
  id: string;
  name: string;
  displayName: string;
  domain: ProductDomain;
  ageEvidence: AgeEvidence | null;
  material: string | null;
  materialConflict: boolean;
  imageUrls: string[];
  brand: string | null;
  category: string;
  stage: string | null;
  imageUrl: string | null;
  fitStatus: FitEvidenceStatus;
  fitSource: string | null;
  sizeGuide: SizeGuide | null;
  availableSizes: string[];
  minPrice: number | null;
  maxPrice: number | null;
  offerCount: number;
  offers: ClientOffer[];
  [sourceField: string]: unknown;
}

/** Keep raw published rows intact; normalization creates a separate view model. */
export interface CatalogSnapshot {
  products: Record<string, unknown>[];
  syncedAt?: string;
  expiresAt?: string;
  storagePolicy?: string;
  groupingVersion?: number;
  [metadata: string]: unknown;
}

export interface PriceChange {
  productId: string;
  observedAt: string;
  previousPrice: number;
  price: number;
  direction: "down" | "up";
  changeAmount: number;
}

export interface DiscoveryProduct extends ClientProduct {
  price: number | null;
  merchant: string;
  cat: string;
  browseOffer?: ClientOffer;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}
