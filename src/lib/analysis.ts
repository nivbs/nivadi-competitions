import type { SessionView } from "@/lib/queries";
import { opponentOf, summarizeGames, type PlayerSlug, type PlayerTally } from "@/lib/scoring";

export type Analysis = {
  totalSessions: number;
  totalGames: number;
  niv: PlayerTally;
  gilad: PlayerTally;
  sessionWins: { niv: number; gilad: number; ties: number };
  /** Share of decided games won by Niv. */
  nivGameWinRate: number | null;
  /** Share of each player's wins that were Mars or backgammon. */
  nivBigWinShare: number | null;
  giladBigWinShare: number | null;
  avgTimeUsedSec: { niv: number | null; gilad: number | null };
  /** Positive = Niv uses less clock than Gilad on average. */
  avgTimeAdvantageSec: number | null;
  timedOut: { niv: number; gilad: number };
  streak: { owner: PlayerSlug | null; length: number };
  gamesPerWeek: number | null;
};

const mean = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null);

export function analyzeSessions(sessions: SessionView[]): Analysis {
  const chrono = [...sessions].sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
  const allGames = chrono.flatMap((s) => s.games);
  const total = summarizeGames(allGames);

  const sessionWins = { niv: 0, gilad: 0, ties: 0 };
  for (const s of chrono) {
    if (s.games.length === 0) continue;
    if (s.summary.leader) sessionWins[s.summary.leader] += 1;
    else sessionWins.ties += 1;
  }

  const nivTimes: number[] = [];
  const giladTimes: number[] = [];
  const advantages: number[] = [];
  const timedOut = { niv: 0, gilad: 0 };
  for (const g of allGames) {
    if (g.nivTimeUsedSec != null && g.giladTimeUsedSec != null) {
      nivTimes.push(g.nivTimeUsedSec);
      giladTimes.push(g.giladTimeUsedSec);
      advantages.push(g.giladTimeUsedSec - g.nivTimeUsedSec);
    }
    // The player who ran out of time is the opponent of the winner.
    if (g.timedOut) timedOut[opponentOf(g.winner)] += 1;
  }

  let owner: PlayerSlug | null = null;
  let length = 0;
  for (let i = allGames.length - 1; i >= 0; i -= 1) {
    const w = allGames[i].winner;
    if (owner === null) {
      owner = w;
      length = 1;
    } else if (w === owner) length += 1;
    else break;
  }

  let gamesPerWeek: number | null = null;
  if (chrono.length >= 2) {
    const span = chrono[chrono.length - 1].playedAt.getTime() - chrono[0].playedAt.getTime();
    gamesPerWeek = allGames.length / Math.max(span / (7 * 864e5), 1);
  }

  const share = (t: PlayerTally) => (t.games ? (t.mars + t.backgammons) / t.games : null);

  return {
    totalSessions: chrono.length,
    totalGames: total.totalGames,
    niv: total.niv,
    gilad: total.gilad,
    sessionWins,
    nivGameWinRate: total.totalGames ? total.niv.games / total.totalGames : null,
    nivBigWinShare: share(total.niv),
    giladBigWinShare: share(total.gilad),
    avgTimeUsedSec: { niv: mean(nivTimes), gilad: mean(giladTimes) },
    avgTimeAdvantageSec: mean(advantages),
    timedOut,
    streak: { owner, length },
    gamesPerWeek,
  };
}
