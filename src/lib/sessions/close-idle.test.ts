import { describe, expect, it } from "vitest";

import { IDLE_SESSION_MS, isSessionIdle } from "./close-idle";

describe("isSessionIdle", () => {
  it("is idle after 15 minutes without activity", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    const last = new Date(now.getTime() - IDLE_SESSION_MS - 1);
    expect(isSessionIdle(last, now)).toBe(true);
  });

  it("is not idle just under the window", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    const last = new Date(now.getTime() - IDLE_SESSION_MS + 1000);
    expect(isSessionIdle(last, now)).toBe(false);
  });
});
