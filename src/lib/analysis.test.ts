import { describe, expect, it } from "vitest";

import { analyzeSessions } from "./analysis";
import type { SessionView } from "./queries";
import { summarizeGames } from "./scoring";

function session(day: number, games: SessionView["games"]): SessionView {
  return {
    id: String(day),
    playedAt: new Date(2026, 0, day),
    notes: null,
    finishedAt: new Date(),
    games,
    summary: summarizeGames(games),
  };
}
const g = (winner: "niv" | "gilad", winType: "normal" | "mars" = "normal", timedOut = false) =>
  ({
    id: Math.random().toString(),
    sessionId: "",
    position: 1,
    winner,
    winType,
    nivTimeUsedSec: 100,
    giladTimeUsedSec: 150,
    bankSec: 360,
    delaySec: 12,
    timedOut,
    endedAt: new Date(),
  }) satisfies SessionView["games"][number];

describe("analyzeSessions", () => {
  it("counts points, mars share, streak and timeouts", () => {
    const a = analyzeSessions([
      session(1, [g("niv", "mars"), g("gilad")]),
      session(2, [g("gilad"), g("gilad", "normal", true)]),
    ]);
    expect(a.niv.points).toBe(2);
    expect(a.gilad.points).toBe(3);
    expect(a.nivBigWinShare).toBe(1);
    expect(a.streak).toEqual({ owner: "gilad", length: 3 });
    expect(a.timedOut.niv).toBe(1);
    expect(a.sessionWins).toEqual({ niv: 1, gilad: 1, ties: 0 });
    expect(a.avgTimeAdvantageSec).toBe(50);
  });
});
