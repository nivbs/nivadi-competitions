import { asc, desc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { competitions, games, players, sessions } from "@/db/schema";
import {
  summarizeGames,
  type PlayerSlug,
  type SessionSummary,
  type WinType,
} from "@/lib/scoring";

export type GameView = {
  id: string;
  sessionId: string;
  position: number;
  winner: PlayerSlug;
  winType: WinType;
  nivTimeUsedSec: number | null;
  giladTimeUsedSec: number | null;
  bankSec: number | null;
  delaySec: number | null;
  timedOut: boolean;
  endedAt: Date;
};

export type SessionView = {
  id: string;
  playedAt: Date;
  notes: string | null;
  finishedAt: Date | null;
  games: GameView[];
  summary: SessionSummary;
};

export async function getActiveCompetition() {
  const db = getDb();
  return db.query.competitions.findFirst({
    where: eq(competitions.status, "active"),
    orderBy: [desc(competitions.startsAt)],
  });
}

export async function getPlayersBySlug() {
  const db = getDb();
  const rows = await db.select().from(players);
  const bySlug = Object.fromEntries(rows.map((p) => [p.slug, p])) as Record<
    string,
    (typeof rows)[0]
  >;
  return bySlug;
}

type PlayerIds = { niv: string; gilad: string };

function toView(
  s: typeof sessions.$inferSelect,
  rows: (typeof games.$inferSelect)[],
  ids: PlayerIds,
): SessionView {
  const gameViews: GameView[] = rows
    .filter((g) => g.sessionId === s.id)
    .sort((a, b) => a.position - b.position)
    .map((g) => ({
      id: g.id,
      sessionId: g.sessionId,
      position: g.position,
      winner: g.winnerPlayerId === ids.niv ? "niv" : "gilad",
      winType: g.winType,
      nivTimeUsedSec: g.nivTimeUsedSec,
      giladTimeUsedSec: g.giladTimeUsedSec,
      bankSec: g.bankSec,
      delaySec: g.delaySec,
      timedOut: g.timedOut,
      endedAt: g.endedAt,
    }));
  return {
    id: s.id,
    playedAt: s.playedAt,
    notes: s.notes,
    finishedAt: s.finishedAt,
    games: gameViews,
    summary: summarizeGames(gameViews),
  };
}

async function hydrate(
  rows: (typeof sessions.$inferSelect)[],
  ids: PlayerIds,
): Promise<SessionView[]> {
  if (rows.length === 0) return [];
  const db = getDb();
  const gameRows = await db
    .select()
    .from(games)
    .where(
      inArray(
        games.sessionId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(games.position));
  return rows.map((s) => toView(s, gameRows, ids));
}

export async function listSessionsForCompetition(
  competitionId: string,
  ids: PlayerIds,
): Promise<SessionView[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.competitionId, competitionId))
    .orderBy(desc(sessions.playedAt), desc(sessions.createdAt));
  return hydrate(rows, ids);
}

export async function getSession(
  id: string,
  ids: PlayerIds,
): Promise<SessionView | null> {
  const db = getDb();
  const [row] = await db.select().from(sessions).where(eq(sessions.id, id));
  if (!row) return null;
  const [view] = await hydrate([row], ids);
  return view ?? null;
}
