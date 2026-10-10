import type { PriceChange } from "./types";
import { isRecord } from "./types";

export function positivePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function latestPriceChange(
  events: readonly PriceChange[] = [],
  productId: string,
): PriceChange | null {
  let latest: PriceChange | null = null,
    latestTime = -Infinity;
  for (const event of events) {
    if (String(event.productId) !== String(productId)) continue;
    const time = Date.parse(event.observedAt);
    if (Number.isFinite(time) && time >= latestTime) {
      latest = event;
      latestTime = time;
    }
  }
  return latest;
}

export function isTargetPriceReached(
  currentPrice: unknown,
  targetPrice: unknown,
): boolean {
  const current = positivePrice(currentPrice),
    target = positivePrice(targetPrice);
  return current !== null && target !== null && current <= target;
}

/** Discard malformed observations, retaining original timestamps/direction/amount. */
export function parsePriceHistory(input: unknown): PriceChange[] {
  if (!isRecord(input) || !Array.isArray(input.events)) return [];
  return input.events.flatMap((event): PriceChange[] => {
    if (
      !isRecord(event) ||
      (typeof event.productId !== "string" &&
        typeof event.productId !== "number") ||
      typeof event.observedAt !== "string" ||
      !Number.isFinite(Date.parse(event.observedAt)) ||
      typeof event.direction !== "string" ||
      !["up", "down"].includes(event.direction)
    )
      return [];
    const previousPrice = positivePrice(event.previousPrice),
      price = positivePrice(event.price);
    const changeAmount =
      typeof event.changeAmount === "number" ? event.changeAmount : NaN;
    if (
      previousPrice === null ||
      price === null ||
      !Number.isFinite(changeAmount)
    )
      return [];
    return [
      {
        productId: String(event.productId),
        observedAt: event.observedAt,
        previousPrice,
        price,
        direction: event.direction as "up" | "down",
        changeAmount,
      },
    ];
  });
}
