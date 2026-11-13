export const PLAYER_SLUGS = ["niv", "gilad"] as const;
export type PlayerSlug = (typeof PLAYER_SLUGS)[number];

export const WIN_TYPES = ["normal", "mars", "backgammon"] as const;
export type WinType = (typeof WIN_TYPES)[number];

/** Points awarded per win type. Mars = gammon (2), backgammon = triple (3). */
export const WIN_POINTS: Record<WinType, number> = {
  normal: 1,
  mars: 2,
  backgammon: 3,
};

export function pointsFor(winType: WinType): number {
  return WIN_POINTS[winType];
}

export function opponentOf(player: PlayerSlug): PlayerSlug {
  return player === "niv" ? "gilad" : "niv";
}

export type ScoredGame = { winner: PlayerSlug; winType: WinType };

export type PlayerTally = {
  games: number;
  points: number;
  mars: number;
  backgammons: number;
};

export type SessionSummary = {
  totalGames: number;
  niv: PlayerTally;
  gilad: PlayerTally;
  /** Who leads by points (ties on points fall back to games, then null). */
  leader: PlayerSlug | null;
};

function emptyTally(): PlayerTally {
  return { games: 0, points: 0, mars: 0, backgammons: 0 };
}

export function summarizeGames(games: ScoredGame[]): SessionSummary {
  const niv = emptyTally();
  const gilad = emptyTally();
  for (const g of games) {
    const t = g.winner === "niv" ? niv : gilad;
    t.games += 1;
    t.points += pointsFor(g.winType);
    if (g.winType === "mars") t.mars += 1;
    if (g.winType === "backgammon") t.backgammons += 1;
  }
  let leader: PlayerSlug | null = null;
  if (niv.points !== gilad.points) {
    leader = niv.points > gilad.points ? "niv" : "gilad";
  } else if (niv.games !== gilad.games) {
    leader = niv.games > gilad.games ? "niv" : "gilad";
  }
  return { totalGames: games.length, niv, gilad, leader };
}
