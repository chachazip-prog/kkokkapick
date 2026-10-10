import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createImageAvailabilityState, toClientProduct } from "@/domain";
import type { ImageRecoveryStatus } from "@/domain";
import { CommerceGallery, PhotoTile } from "./commerce-gallery";

const context = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock("./catalog-provider", () => ({ useKkokkapick: () => context.value }));

const url = "https://shop.example/one.jpg";
const stamp = "2026-10-08T12:00:00Z";
const now = Date.parse("2026-10-08T12:30:00Z");
const product = toClientProduct({ id: "p", name: "아기 옷", imageUrl: url });

beforeEach(() => {
  const images = createImageAvailabilityState();
  images.setSnapshot(stamp, now);
  context.value = {
    images,
    recoverPhoto: vi.fn(
      async (): Promise<ImageRecoveryStatus> => "unavailable",
    ),
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("original commerce photo recovery", () => {
  it("retries the original URL after reconnection while preserving an offline photo", async () => {
    const recover = vi.fn(async (): Promise<ImageRecoveryStatus> => "offline");
    context.value.recoverPhoto = recover;
    render(<PhotoTile product={product} onOpen={() => {}} />);
    const original = screen.getByRole("img") as HTMLImageElement;
    await act(async () => {
      fireEvent.error(original);
    });
    expect(
      screen.getByText("인터넷 연결 후 사진을 다시 확인해요."),
    ).toBeTruthy();
    expect(original.style.visibility).toBe("hidden");
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
    const retry = screen.getByRole("img") as HTMLImageElement;
    expect(retry).not.toBe(original);
    expect(retry.getAttribute("src")).toBe(url);
    expect(
      screen.queryByText("인터넷 연결 후 사진을 다시 확인해요."),
    ).toBeNull();
    expect(recover).toHaveBeenCalledTimes(1);
  });

  it("passes a rendered-reload failure to the shared quarantine policy without more probe retries", async () => {
    const recover = vi.fn(
      async (
        _url: string,
        _generation: number,
        afterReload = false,
      ): Promise<ImageRecoveryStatus> =>
        afterReload ? "unavailable" : "available",
    );
    context.value.recoverPhoto = recover;
    render(<PhotoTile product={product} onOpen={() => {}} />);
    await act(async () => {
      fireEvent.error(screen.getByRole("img"));
    });
    await act(async () => {
      fireEvent.error(screen.getByRole("img"));
    });
    expect(recover.mock.calls.map((call) => call[2])).toEqual([false, true]);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("사진 연결을 확인해 주세요.")).toBeTruthy();
  });

  it("resets failure presentation for unchanged URLs only after a newer source generation", async () => {
    const images = context.value.images as ReturnType<
      typeof createImageAvailabilityState
    >;
    const { rerender } = render(<CommerceGallery product={product} />);
    await act(async () => {
      fireEvent.error(screen.getByRole("img"));
    });
    expect(screen.queryByRole("img")).toBeNull();
    expect(images.setSnapshot("2026-10-08T12:15:00Z", now)).toBe(true);
    rerender(<CommerceGallery product={product} />);
    expect(
      (screen.getByRole("img") as HTMLImageElement).getAttribute("src"),
    ).toBe(url);
    expect(screen.queryByText("사진 연결을 확인해 주세요.")).toBeNull();
  });
});
