export const won = (value: number | null | undefined) =>
  value !== null && value !== undefined && Number.isFinite(value)
    ? new Intl.NumberFormat("ko-KR").format(value) + "원"
    : "가격 확인 필요";
export function sourceTime(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "시각 확인 필요";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date) + " 한국시간"
    : "시각 확인 필요";
}
export function sellerUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
