import type { matches } from "@/db/schema";

import { MAX_TIME_SECONDS } from "./match-validation";

type MatchRow = typeof matches.$inferSelect;

export type MatchAnalysis = {
  totalMatches: number;
  nivWins: number;
  giladWins: number;
  ties: number;
  nivWinRate: number | null;
  averageScoreDiffNiv: number | null;
  /** Positive = Niv tends to finish with more time left (used less clock). */
  averageTimeRemainingAdvantageSec: number | null;
  nivAvgTimeUsedSec: number | null;
  giladAvgTimeUsedSec: number | null;
  nivBankBursts: number;
  giladBankBursts: number;
  currentStreakOwner: "niv" | "gilad" | null;
  currentStreakLength: number;
  matchesPerWeek: number | null;
};

function mean(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function analyzeMatches(
  rows: MatchRow[],
  opts: { nivPlayerId: string; giladPlayerId: string },
): MatchAnalysis {
  const sorted = [...rows].sort(
    (a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime(),
  );

  let nivWins = 0;
  let giladWins = 0;
  let ties = 0;
  const scoreDiffs: number[] = [];
  const timeAdvSec: number[] = [];
  const nivTimes: number[] = [];
  const giladTimes: number[] = [];
  let nivBankBursts = 0;
  let giladBankBursts = 0;

  for (const m of sorted) {
    scoreDiffs.push(m.nivScore - m.giladScore);
    timeAdvSec.push(m.giladTimeUsedSec - m.nivTimeUsedSec);
    nivTimes.push(m.nivTimeUsedSec);
    giladTimes.push(m.giladTimeUsedSec);
    if (m.nivTimeUsedSec >= MAX_TIME_SECONDS) {
      nivBankBursts += 1;
    }
    if (m.giladTimeUsedSec >= MAX_TIME_SECONDS) {
      giladBankBursts += 1;
    }
    if (m.winnerPlayerId === opts.nivPlayerId) {
      nivWins += 1;
    } else if (m.winnerPlayerId === opts.giladPlayerId) {
      giladWins += 1;
    } else {
      ties += 1;
    }
  }

  const total = sorted.length;
  const decided = nivWins + giladWins;
  const nivWinRate = decided > 0 ? nivWins / decided : null;

  let currentStreakOwner: "niv" | "gilad" | null = null;
  let currentStreakLength = 0;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const w = sorted[i].winnerPlayerId;
    let owner: "niv" | "gilad" | null = null;
    if (w === opts.nivPlayerId) {
      owner = "niv";
    } else if (w === opts.giladPlayerId) {
      owner = "gilad";
    }
    if (owner === null) {
      break;
    }
    if (currentStreakOwner === null) {
      currentStreakOwner = owner;
      currentStreakLength = 1;
      continue;
    }
    if (owner === currentStreakOwner) {
      currentStreakLength += 1;
    } else {
      break;
    }
  }

  let matchesPerWeek: number | null = null;
  if (sorted.length >= 2) {
    const first = new Date(sorted[0].playedAt).getTime();
    const last = new Date(sorted[sorted.length - 1].playedAt).getTime();
    const weeks = Math.max((last - first) / (7 * 24 * 60 * 60 * 1000), 1e-6);
    matchesPerWeek = sorted.length / weeks;
  }

  return {
    totalMatches: total,
    nivWins,
    giladWins,
    ties,
    nivWinRate,
    averageScoreDiffNiv: mean(scoreDiffs),
    averageTimeRemainingAdvantageSec: mean(timeAdvSec),
    nivAvgTimeUsedSec: mean(nivTimes),
    giladAvgTimeUsedSec: mean(giladTimes),
    nivBankBursts,
    giladBankBursts,
    currentStreakOwner,
    currentStreakLength,
    matchesPerWeek,
  };
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
