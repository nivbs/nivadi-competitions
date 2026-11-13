import { count, desc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { games, sessions } from "@/db/schema";

export const IDLE_SESSION_MS = 15 * 60 * 1000;

export type CloseIdleResult = { finished: number; deleted: number };

/**
 * Closes open sessions with no new game for {@link IDLE_SESSION_MS}.
 * Sessions with games are finished; empty ones are deleted.
 */
export async function closeIdleSessions(now = new Date()): Promise<CloseIdleResult> {
  const db = getDb();
  const cutoff = new Date(now.getTime() - IDLE_SESSION_MS);

  const open = await db
    .select({ id: sessions.id, createdAt: sessions.createdAt })
    .from(sessions)
    .where(isNull(sessions.finishedAt));

  let finished = 0;
  let deleted = 0;

  for (const row of open) {
    const [lastGame] = await db
      .select({ endedAt: games.endedAt })
      .from(games)
      .where(eq(games.sessionId, row.id))
      .orderBy(desc(games.position))
      .limit(1);

    const lastActivity = lastGame?.endedAt ?? row.createdAt;
    if (lastActivity >= cutoff) continue;

    const [tally] = await db
      .select({ n: count() })
      .from(games)
      .where(eq(games.sessionId, row.id));

    const gameCount = Number(tally?.n ?? 0);
    if (gameCount === 0) {
      await db.delete(sessions).where(eq(sessions.id, row.id));
      deleted += 1;
    } else {
      await db
        .update(sessions)
        .set({ finishedAt: now, updatedAt: now })
        .where(eq(sessions.id, row.id));
      finished += 1;
    }
  }

  return { finished, deleted };
}

/** True when `lastActivity` is older than the idle window relative to `now`. */
export function isSessionIdle(lastActivity: Date, now: Date, idleMs = IDLE_SESSION_MS): boolean {
  return now.getTime() - lastActivity.getTime() >= idleMs;
}
