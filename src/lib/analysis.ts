import type { GameView, SessionView } from "@/lib/queries";
import { opponentOf, summarizeGames, type PlayerSlug, type PlayerTally } from "@/lib/scoring";

/** One point on the clock chart. `at` is epoch ms, chronological within each grain. */
export type PacePoint = {
  id: string;
  at: number;
  nivSec: number;
  giladSec: number;
};

export type PaceGrain = "game" | "session" | "day";

export type Pace = Record<PaceGrain, PacePoint[]>;

/**
 * Who spends less clock, and by how many percent they are faster.
 * 100 means twice as fast (half the time). Null when clocks match or are missing.
 */
export type FasterPlayer = {
  player: PlayerSlug;
  byPct: number;
};

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
  faster: FasterPlayer | null;
  /** Average clock per game, per session, and per Jerusalem calendar day. */
  pace: Pace;
  timedOut: { niv: number; gilad: number };
  streak: { owner: PlayerSlug | null; length: number };
  gamesPerWeek: number | null;
};

const mean = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null);

const JERUSALEM = "Asia/Jerusalem";

/** Calendar day in the players' timezone, so a late sitting stays on one point. */
function jerusalemDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JERUSALEM,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function timedPair(g: GameView): { niv: number; gilad: number } | null {
  if (g.nivTimeUsedSec == null || g.giladTimeUsedSec == null) return null;
  return { niv: g.nivTimeUsedSec, gilad: g.giladTimeUsedSec };
}

function fasterPlayer(niv: number | null, gilad: number | null): FasterPlayer | null {
  if (niv == null || gilad == null) return null;
  if (Math.abs(niv - gilad) < 1) return null;
  const nivFaster = niv < gilad;
  const fast = nivFaster ? niv : gilad;
  const slow = nivFaster ? gilad : niv;
  if (fast <= 0) return null;
  return {
    player: nivFaster ? "niv" : "gilad",
    byPct: Math.max(1, Math.round((slow / fast - 1) * 100)),
  };
}

/**
 * Percent change from the earlier half of a series to the later half.
 * Negative means the clock got shorter.
 */
export function paceChangePct(values: number[]): number | null {
  if (values.length < 2) return null;
  const mid = Math.floor(values.length / 2);
  const early = mean(values.slice(0, mid));
  const late = mean(values.slice(mid));
  if (early == null || late == null || early === 0) return null;
  return ((late - early) / early) * 100;
}

function buildPace(chrono: SessionView[], allGames: GameView[]): Pace {
  const game: PacePoint[] = [];
  for (const g of allGames) {
    const pair = timedPair(g);
    if (!pair) continue;
    game.push({ id: g.id, at: g.endedAt.getTime(), nivSec: pair.niv, giladSec: pair.gilad });
  }

  const session: PacePoint[] = [];
  const days = new Map<string, { at: number; niv: number; gilad: number; n: number }>();
  for (const s of chrono) {
    const pairs = s.games.map(timedPair).filter((p): p is { niv: number; gilad: number } => p != null);
    if (!pairs.length) continue;
    const niv = pairs.reduce((sum, p) => sum + p.niv, 0) / pairs.length;
    const gilad = pairs.reduce((sum, p) => sum + p.gilad, 0) / pairs.length;
    session.push({ id: s.id, at: s.playedAt.getTime(), nivSec: niv, giladSec: gilad });

    const key = jerusalemDay(s.playedAt);
    const prev = days.get(key);
    if (!prev) {
      days.set(key, { at: s.playedAt.getTime(), niv: niv * pairs.length, gilad: gilad * pairs.length, n: pairs.length });
    } else {
      prev.niv += niv * pairs.length;
      prev.gilad += gilad * pairs.length;
      prev.n += pairs.length;
      if (s.playedAt.getTime() < prev.at) prev.at = s.playedAt.getTime();
    }
  }

  const day: PacePoint[] = [...days.entries()]
    .sort((a, b) => a[1].at - b[1].at)
    .map(([id, v]) => ({ id, at: v.at, nivSec: v.niv / v.n, giladSec: v.gilad / v.n }));

  return { game, session, day };
}

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
  const avgNiv = mean(nivTimes);
  const avgGilad = mean(giladTimes);

  return {
    totalSessions: chrono.length,
    totalGames: total.totalGames,
    niv: total.niv,
    gilad: total.gilad,
    sessionWins,
    nivGameWinRate: total.totalGames ? total.niv.games / total.totalGames : null,
    nivBigWinShare: share(total.niv),
    giladBigWinShare: share(total.gilad),
    avgTimeUsedSec: { niv: avgNiv, gilad: avgGilad },
    avgTimeAdvantageSec: mean(advantages),
    faster: fasterPlayer(avgNiv, avgGilad),
    pace: buildPace(chrono, allGames),
    timedOut,
    streak: { owner, length },
    gamesPerWeek,
  };
}
