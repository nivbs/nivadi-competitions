import { describe, expect, it } from "vitest";

import { analyzeSessions, paceChangePct } from "./analysis";
import type { SessionView } from "./queries";
import { summarizeGames } from "./scoring";

function session(day: number, games: SessionView["games"], id = String(day)): SessionView {
  return {
    id,
    playedAt: new Date(`2026-01-${String(day).padStart(2, "0")}T12:00:00+02:00`),
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
    expect(a.faster).toEqual({ player: "niv", byPct: 50 });
    expect(a.pace.game).toHaveLength(4);
    expect(a.pace.session).toHaveLength(2);
    expect(a.pace.day).toHaveLength(2);
  });

  it("names the faster player by speed and buckets one Jerusalem day together", () => {
    const untimed = { ...g("gilad"), id: "untimed", nivTimeUsedSec: null, giladTimeUsedSec: null };
    const a = analyzeSessions([
      session(1, [g("niv"), g("gilad")], "morning"),
      session(1, [g("niv")], "evening"),
      session(3, [untimed], "manual"),
    ]);
    expect(a.faster).toEqual({ player: "niv", byPct: 50 });
    expect(a.pace.game).toHaveLength(3);
    expect(a.pace.session.map((p) => p.id)).toEqual(["morning", "evening"]);
    expect(a.pace.day).toHaveLength(1);
    expect(a.pace.day[0]).toMatchObject({ id: "2026-01-01", nivSec: 100, giladSec: 150 });
    expect(paceChangePct([100, 80, 40, 40])).toBeCloseTo(-55.556, 2);
    expect(paceChangePct([40])).toBeNull();
  });

  it("splits the clock chart after midnight in Jerusalem", () => {
    const late = session(1, [g("niv")], "late");
    late.playedAt = new Date("2026-01-01T23:30:00+02:00");
    const next = session(2, [g("gilad")], "next");
    next.playedAt = new Date("2026-01-02T00:30:00+02:00");
    const a = analyzeSessions([next, late]);
    expect(a.pace.day.map((p) => p.id)).toEqual(["2026-01-01", "2026-01-02"]);
    expect(a.pace.session.map((p) => p.id)).toEqual(["late", "next"]);
  });

  it("calls Gilad faster when his clock is half as long, and ties when they match", () => {
    const quicker = g("gilad");
    quicker.nivTimeUsedSec = 180;
    quicker.giladTimeUsedSec = 90;
    expect(analyzeSessions([session(4, [quicker])]).faster).toEqual({ player: "gilad", byPct: 100 });

    const tied = g("niv");
    tied.giladTimeUsedSec = 100;
    const even = analyzeSessions([session(5, [tied])]);
    expect(even.faster).toBeNull();
    expect(even.pace.game).toHaveLength(1);
  });
});
