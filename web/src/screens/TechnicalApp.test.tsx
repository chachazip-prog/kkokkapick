import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toClientProduct } from "@/domain";
import type {
  ChildProfileInput,
  ClientProduct,
  DiscoveryProduct,
} from "@/domain";
import { useLocalRecords } from "@/hooks/use-local-records";
import { TechnicalApp } from "./TechnicalApp";

const context = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock("@/components/catalog-provider", () => ({
  useKkokkapick: () => context.value,
}));
vi.mock("@/components/commerce-gallery", () => ({
  CommerceGallery: () => <div />,
  PhotoFeed: ({
    products,
    onOpen,
  }: {
    products: ClientProduct[];
    onOpen: (product: ClientProduct) => void;
  }) => (
    <div>
      {products.map((product) => (
        <button
          key={product.id}
          data-photo={product.id}
          onClick={() => onOpen(product)}
        >
          {product.displayName} 상품 카드 보기
        </button>
      ))}
    </div>
  ),
}));

const product: DiscoveryProduct = {
  ...toClientProduct({
    id: "p",
    name: "아기 옷",
    brand: "아가방",
    domain: "apparel",
    category: "상하복",
    offerCount: 4,
    offers: [
      {
        merchant: "판매처 A",
        price: 10000,
        availableSizes: ["80"],
        affiliateUrl: "https://shop-a.example/p",
      },
      {
        merchant: "판매처 A",
        price: 11000,
        availableSizes: ["90"],
        affiliateUrl: "https://shop-a.example/q",
      },
      {
        merchant: "판매처 B",
        price: 12000,
        availableSizes: ["80"],
        affiliateUrl: "https://shop-b.example/p",
      },
      {
        merchant: "판매처 B",
        price: 13000,
        availableSizes: ["90"],
        affiliateUrl: "https://shop-b.example/q",
      },
    ],
  }),
  price: 10000,
  merchant: "판매처 A",
  cat: "상하복",
};

function LocationEvidence() {
  const location = useLocation();
  return (
    <output aria-label="경로">{location.pathname + location.search}</output>
  );
}

function Harness({ path = "/technical/search" }: { path?: string }) {
  const records = useLocalRecords();
  const [drafts, setDrafts] = useState<{
    child: Record<string, ChildProfileInput>;
    price: Record<string, string>;
  }>({ child: {}, price: {} });
  context.value = {
    records,
    drafts,
    setDrafts,
    state: { status: "ready", products: [product], history: [] },
    refreshing: false,
    refreshFailed: false,
    refresh: vi.fn(),
  };
  return (
    <MemoryRouter initialEntries={[path]}>
      <TechnicalApp />
      <LocationEvidence />
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    setTimeout(() => callback(0), 0),
  );
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("technical migration interactions", () => {
  it("counts distinct sellers rather than treating repeated listings as different sellers", () => {
    render(<Harness />);
    expect(screen.getByText("2개 판매처 · 가격 비교")).toBeTruthy();
    expect(screen.queryByText("4개 판매처 · 가격 비교")).toBeNull();
  });

  it("retains filter bounds, focuses an invalid input, and commits only a valid ordered range", async () => {
    render(
      <Harness path="/technical/search?q=%EC%95%84%EA%B8%B0&mode=products&sort=low" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "필터" }));
    const sheet = screen.getByRole("dialog", { name: "상세 필터" });
    const min = within(sheet).getByLabelText("최소 가격") as HTMLInputElement;
    const max = within(sheet).getByLabelText("최대 가격") as HTMLInputElement;
    fireEvent.change(min, { target: { value: "-1" } });
    fireEvent.click(within(sheet).getByRole("button", { name: "상품 보기" }));
    expect(document.activeElement).toBe(min);
    expect(min.value).toBe("-1");
    expect(within(sheet).getByRole("alert").textContent).toContain(
      "0 이상의 숫자",
    );
    expect(screen.getByLabelText("경로").textContent).not.toContain("min=");
    fireEvent.change(min, { target: { value: "10000" } });
    fireEvent.change(max, { target: { value: "9000" } });
    fireEvent.click(within(sheet).getByRole("button", { name: "상품 보기" }));
    expect(document.activeElement).toBe(max);
    expect(max.value).toBe("9000");
    fireEvent.change(max, { target: { value: "12000" } });
    fireEvent.click(within(sheet).getByRole("button", { name: "상품 보기" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByLabelText("경로").textContent).toContain(
      "min=10000&max=12000",
    );
    fireEvent.click(screen.getByRole("link", { name: "마이" }));
    expect(screen.getByLabelText("경로").textContent).toBe(
      "/technical/my?q=%EC%95%84%EA%B8%B0&mode=products&sort=low&min=10000&max=12000",
    );
    fireEvent.click(screen.getByRole("link", { name: "검색" }));
    fireEvent.click(screen.getByRole("button", { name: "필터" }));
    fireEvent.click(screen.getByRole("button", { name: "필터 초기화" }));
    expect(screen.getByLabelText("경로").textContent).toBe(
      "/technical/search?q=%EC%95%84%EA%B8%B0&mode=products&sort=low",
    );
  });

  it("focuses invalid target prices, preserves entered values, and returns to the original product after closing", async () => {
    render(
      <Harness path="/technical/search?q=%EC%95%84%EA%B8%B0&seller=%ED%8C%90%EB%A7%A4%EC%B2%98+A" />,
    );
    const opener = screen.getByRole("button", { name: /아기 옷/ });
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "상품 상세" });
    const price = within(dialog).getByLabelText(
      "희망 가격",
    ) as HTMLInputElement;
    fireEvent.change(price, { target: { value: "-10" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "저장" }));
    expect(document.activeElement).toBe(price);
    expect(price.value).toBe("-10");
    expect(localStorage.getItem("priceAlerts")).toBeNull();
    fireEvent.change(price, { target: { value: "8000" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "저장" }));
    expect(JSON.parse(localStorage.getItem("priceAlerts") || "null")).toEqual({
      p: 8000,
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));
    await waitFor(() => expect(document.activeElement).toBe(opener));
    expect(screen.getByLabelText("경로").textContent).toBe(
      "/technical/search?q=%EC%95%84%EA%B8%B0&seller=%ED%8C%90%EB%A7%A4%EC%B2%98+A",
    );
    expect(
      JSON.parse(localStorage.getItem("recentProducts") || "null"),
    ).toEqual(["p"]);
  });

  it("keeps composition text out of the URL until Korean IME completes and blocks Enter submission", () => {
    render(<Harness />);
    const search = screen.getByRole("searchbox");
    fireEvent.compositionStart(search);
    fireEvent.change(search, { target: { value: "아기" } });
    expect(
      fireEvent.keyDown(search, {
        key: "Enter",
        isComposing: true,
        keyCode: 229,
      }),
    ).toBe(false);
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.getByLabelText("경로").textContent).toBe("/technical/search");
    fireEvent.compositionEnd(search, { data: "아기" });
    expect(screen.getByLabelText("경로").textContent).toContain(
      "q=%EC%95%84%EA%B8%B0",
    );
  });

  it("renders an explicit unknown-route state rather than displaying search for an unrecognized page", () => {
    render(<Harness path="/technical/missing" />);
    expect(
      screen.getByRole("heading", { name: "화면을 찾을 수 없어요." }),
    ).toBeTruthy();
    expect(screen.queryByRole("search")).toBeNull();
  });
});
