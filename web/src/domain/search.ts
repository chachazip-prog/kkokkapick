import type { ClientOffer, DiscoveryProduct, PriceChange } from "./types";
import { isApparel, matchesMonths, stageForMonths } from "./product-domain";
import { latestPriceChange, positivePrice } from "./price";

export interface SellerFilters {
  size?: string;
  seller?: string;
  min?: number;
  max?: number;
}
export interface QueryOptions extends SellerFilters {
  query?: string;
  domain?: "apparel" | "play" | "all";
  stage?: string;
  category?: string;
  brand?: string;
  fitOnly?: boolean;
  favoritesOnly?: boolean;
  favoriteIds?: ReadonlySet<string>;
  months?: unknown;
  sort?: "popular" | "recommended" | "low" | "high" | "drop";
  priceHistory?: readonly PriceChange[];
}

export function offerMatchesFilters(
  offer: ClientOffer,
  filters: SellerFilters,
): boolean {
  const { size, seller, min, max } = filters,
    price = positivePrice(offer.price);
  return (
    (!seller || offer.merchant === seller) &&
    (!size || offer.availableSizes.includes(size)) &&
    (!min || (price !== null && price >= min)) &&
    (!max || (price !== null && price <= max))
  );
}

export function matchesSellerOptions(
  product: DiscoveryProduct,
  filters: SellerFilters,
): boolean {
  if (!filters.size && !filters.seller && !filters.min && !filters.max)
    return true;
  return product.offers.some((offer) => offerMatchesFilters(offer, filters));
}

export function matchesPlayStage(
  product: DiscoveryProduct,
  stage: string,
  months?: unknown,
): boolean {
  if (stage === "전체") return true;
  if (stage === "아이월령") return matchesMonths(product, months);
  const bounds: Record<string, [number, number]> = {
    신생아: [0, 3],
    베이비: [4, 23],
    유아: [24, 47],
    토들러: [48, 71],
    키즈: [72, 180],
  };
  const range = bounds[stage],
    evidence = product.ageEvidence;
  return (
    !!evidence &&
    !!range &&
    evidence.minMonths <= range[0] &&
    (evidence.maxMonths === null || evidence.maxMonths >= range[1])
  );
}

export function recommendationScore(
  product: DiscoveryProduct,
  context: { stage?: string | null; months?: unknown } = {},
): number {
  if (!isApparel(product))
    return context.months !== undefined &&
      matchesMonths(product, context.months)
      ? 12
      : 0;
  let score =
    product.fitStatus === "verified"
      ? 18
      : product.fitStatus === "candidate"
        ? 4
        : 0;
  if (product.brand) score += 3;
  score +=
    Math.min(
      Math.max((product.offerCount || product.offers.length || 0) - 1, 0),
      4,
    ) * 5;
  if (context.stage && context.stage !== "전체") {
    if (product.stage === context.stage) score += 12;
    else if (
      context.stage === "토들러" &&
      (product.stage === "유아" || product.stage === "키즈")
    )
      score += 5;
  }
  if (Number(product.minPrice) > 0) score += 1;
  return score;
}

export function compareRecommended(
  a: DiscoveryProduct,
  b: DiscoveryProduct,
  context: { stage?: string | null; months?: unknown } = {},
): number {
  const difference =
    recommendationScore(b, context) - recommendationScore(a, context);
  if (difference) return difference;
  const offers =
    (b.offerCount || b.offers.length || 0) -
    (a.offerCount || a.offers.length || 0);
  if (offers) return offers;
  const price = (a.minPrice || Infinity) - (b.minPrice || Infinity);
  if (price && !Number.isNaN(price)) return price;
  return a.id.localeCompare(b.id);
}

/** Token AND search and seller constraints mirror the published web semantics. */
export function queryProducts(
  products: readonly DiscoveryProduct[],
  options: QueryOptions = {},
): DiscoveryProduct[] {
  const {
    domain = "all",
    stage = "전체",
    category = "전체",
    brand = "전체",
    months,
    query = "",
    sort = "recommended",
  } = options;
  const tokens = query.trim().toLowerCase().split(/\s+/);
  let result = products.filter((product) => {
    const haystack =
      `${product.name} ${product.brand || ""} ${product.cat} ${product.stage} ${product.offers.map((offer) => offer.merchant).join(" ")}`.toLowerCase();
    const stageMatches =
      domain === "play"
        ? matchesPlayStage(product, stage, months)
        : stage === "전체" ||
          product.stage === stage ||
          (stage === "토들러" &&
            ["유아", "키즈"].includes(product.stage || ""));
    return (
      (domain === "all" ||
        (domain === "apparel" ? isApparel(product) : !isApparel(product))) &&
      (!options.favoritesOnly || !!options.favoriteIds?.has(product.id)) &&
      (brand === "전체" || product.brand === brand) &&
      stageMatches &&
      (category === "전체" || category === product.cat) &&
      (!options.fitOnly || product.fitStatus === "verified") &&
      matchesSellerOptions(product, options) &&
      tokens.every((token) => haystack.includes(token))
    );
  });
  if (options.size || options.seller || options.min || options.max)
    result = result.map((product) => {
      const offer = product.offers
        .filter((candidate) => offerMatchesFilters(candidate, options))
        .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))[0];
      return offer
        ? { ...product, price: offer.price, browseOffer: offer }
        : product;
    });
  if (sort === "low")
    return result.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
  if (sort === "high")
    return result.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sort === "drop") {
    const drop = (product: DiscoveryProduct) => {
      const event = latestPriceChange(options.priceHistory, product.id);
      return event?.direction === "down" ? Math.abs(event.changeAmount) : 0;
    };
    return result.sort((a, b) => drop(b) - drop(a));
  }
  const knownMonths =
    months !== null &&
    months !== undefined &&
    months !== "" &&
    Number.isFinite(Number(months))
      ? Number(months)
      : null;
  return result.sort((a, b) =>
    compareRecommended(a, b, {
      months,
      stage:
        stage !== "전체"
          ? stage
          : knownMonths !== null
            ? stageForMonths(knownMonths)
            : null,
    }),
  );
}
