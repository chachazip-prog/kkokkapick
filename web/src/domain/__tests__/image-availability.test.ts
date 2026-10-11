import { describe, expect, it } from "vitest";
import { createImageAvailabilityState } from "../image-availability";

const now = Date.parse("2026-10-08T12:30:00Z");
const stamp = "2026-10-08T12:00:00Z";
const one = "https://shop.example/one.jpg",
  two = "https://shop.example/two.jpg";

describe("provider photo availability", () => {
  it("shares two retries across cards and restores only after a valid newer source observation", async () => {
    let probes = 0;
    const delays: number[] = [];
    const state = createImageAvailabilityState({
      probeImpl: async () => {
        probes++;
        return false;
      },
      waitImpl: async (delay) => {
        delays.push(delay);
      },
    });
    state.setSnapshot(stamp, now);
    expect(
      await Promise.all([
        state.recover(one),
        state.recover(one),
        state.recover(one),
      ]),
    ).toEqual(["unavailable", "unavailable", "unavailable"]);
    expect(probes).toBe(2);
    expect(delays).toEqual([350, 900]);
    expect(state.urls({ imageUrl: one, imageUrls: [one, two] })).toEqual([two]);
    for (const value of [
      stamp,
      "invalid",
      "2026-10-08T11:00:00Z",
      "2026-10-08T13:00:00Z",
    ])
      expect(state.setSnapshot(value, now)).toBe(false);
    expect(state.failedCount()).toBe(1);
    expect(state.setSnapshot("2026-10-08T12:15:00Z", now)).toBe(true);
    expect(state.failedCount()).toBe(0);
  });

  it("keeps offline failures distinct and retries after reconnection without deleting source data", async () => {
    let online = false,
      probes = 0;
    const state = createImageAvailabilityState({
      onlineImpl: () => online,
      probeImpl: async () => {
        probes++;
        return false;
      },
      waitImpl: async () => {},
    });
    state.setSnapshot(stamp, now);
    expect(await state.recover(one)).toBe("offline");
    expect(state.markFailed(one)).toBe(false);
    expect(state.urls({ imageUrl: one })).toEqual([one]);
    expect(probes).toBe(0);
    online = true;
    expect(await state.recover(one)).toBe("unavailable");
    expect(probes).toBe(2);
  });

  it("prevents an old generation from quarantining refreshed photos", async () => {
    let resolveProbe!: (value: boolean) => void;
    const state = createImageAvailabilityState({
      probeImpl: () =>
        new Promise((resolve) => {
          resolveProbe = resolve;
        }),
      waitImpl: async () => {},
    });
    state.setSnapshot(stamp, now);
    const generation = state.generation(),
      pending = state.recover(one, generation);
    await Promise.resolve();
    await Promise.resolve();
    state.setSnapshot("2026-10-08T12:15:00Z", now);
    resolveProbe(false);
    expect(await pending).toBe("stale");
    expect(state.markFailed(one, generation)).toBe(false);
    expect(state.failedCount()).toBe(0);
  });
});
