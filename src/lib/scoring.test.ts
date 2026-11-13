import { describe, expect, it } from "vitest";

import { pointsFor, summarizeGames } from "./scoring";

describe("scoring", () => {
  it("awards 1/2/3 points", () => {
    expect(pointsFor("normal")).toBe(1);
    expect(pointsFor("mars")).toBe(2);
    expect(pointsFor("backgammon")).toBe(3);
  });

  it("summarizes games and points separately", () => {
    const s = summarizeGames([
      { winner: "niv", winType: "mars" },
      { winner: "niv", winType: "normal" },
      { winner: "gilad", winType: "normal" },
      { winner: "gilad", winType: "backgammon" },
    ]);
    expect(s.niv).toMatchObject({ games: 2, points: 3, mars: 1 });
    expect(s.gilad).toMatchObject({ games: 2, points: 4, backgammons: 1 });
    expect(s.leader).toBe("gilad");
  });

  it("has no leader when fully tied", () => {
    const s = summarizeGames([
      { winner: "niv", winType: "normal" },
      { winner: "gilad", winType: "normal" },
    ]);
    expect(s.leader).toBeNull();
  });
});
