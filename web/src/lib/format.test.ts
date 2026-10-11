import { describe, expect, it } from "vitest";
import { sellerUrl, sourceTime, won } from "./format";

describe("source facts and external purchase boundaries", () => {
  it("keeps legitimate affiliate parameters unchanged", () => {
    const value = "https://shop.example.com/p/1?affiliate=a%2Fb&color=blue";
    expect(sellerUrl(value)).toBe(value);
  });
  it.each([
    "javascript:alert(1)",
    "data:text/html,test",
    "file:///etc/passwd",
    "//shop.example.com",
    "bad",
    null,
  ])("rejects unsafe or unavailable destinations %s", (value) => {
    expect(sellerUrl(value)).toBeUndefined();
  });
  it("keeps unknown prices unknown", () => {
    expect(won(null)).toBe("가격 확인 필요");
    expect(won(23940)).toBe("23,940원");
  });
  it("discloses the same source instant in Korean local time", () => {
    expect(sourceTime("2026-10-09T07:33:14.805Z")).toContain("16:33");
    expect(sourceTime(null)).toBe("시각 확인 필요");
  });
});
