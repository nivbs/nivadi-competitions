import { describe, expect, it } from "vitest";

import {
  adjustBank,
  createClock,
  pause,
  resume,
  start,
  switchTurn,
  tick,
  usedSeconds,
} from "./engine";

const settings = { bankSec: { niv: 60, gilad: 60 }, delaySec: 10 };

// Tapping "gilad" starts niv's clock (the tapper just finished their move).
const startNiv = () => start(createClock(settings), "gilad", 0);

describe("clock engine", () => {
  it("starts the opponent of the tapped player", () => {
    const c = start(createClock(settings), "niv", 0);
    expect(c.status).toBe("running");
    expect(c.active).toBe("gilad");
  });

  it("spends delay before bank", () => {
    let c = startNiv();
    c = tick(c, 15_000);
    expect(c.delayLeftMs).toBe(0);
    expect(c.bankMs.niv).toBe(55_000);
    expect(c.elapsedMs.niv).toBe(15_000);
  });

  it("does not touch the bank within the delay and resets it on switch", () => {
    let c = startNiv();
    c = switchTurn(c, 8_000);
    expect(c.bankMs.niv).toBe(60_000);
    expect(c.active).toBe("gilad");
    expect(c.delayLeftMs).toBe(10_000);
  });

  it("pauses and resumes without losing time", () => {
    let c = startNiv();
    c = pause(c, 20_000);
    c = tick(c, 99_000);
    expect(c.bankMs.niv).toBe(50_000);
    c = resume(c, 100_000);
    c = tick(c, 105_000);
    expect(c.bankMs.niv).toBe(45_000);
  });

  it("flags at zero and can be rescued by adding time", () => {
    let c = startNiv();
    c = tick(c, 100_000);
    expect(c.status).toBe("flagged");
    expect(c.flagged).toBe("niv");
    c = adjustBank(c, "niv", 30, 100_000);
    expect(c.status).toBe("paused");
    expect(c.bankMs.niv).toBe(30_000);
  });

  it("reports used seconds", () => {
    let c = startNiv();
    c = switchTurn(c, 4_000);
    c = switchTurn(c, 10_000);
    expect(usedSeconds(c)).toEqual({ niv: 4, gilad: 6 });
  });
});
