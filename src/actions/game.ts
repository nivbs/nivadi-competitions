"use server";

import { asc, desc, eq } from "drizzle-orm";

import { getDict } from "@/lib/i18n/server";
import { getDb } from "@/db";
import { games, sessions } from "@/db/schema";
import { revalidateAll, withContext, type ActionResult } from "@/actions/guard";
import {
  gameInputSchema,
  uuidSchema,
  type GameInput,
} from "@/lib/validation/session";

function toRow(
  g: GameInput,
  ids: { niv: string; gilad: string },
): Omit<typeof games.$inferInsert, "sessionId" | "position"> {
  return {
    winnerPlayerId: g.winner === "niv" ? ids.niv : ids.gilad,
    winType: g.winType,
    nivTimeUsedSec: g.nivTimeUsedSec ?? null,
    giladTimeUsedSec: g.giladTimeUsedSec ?? null,
    bankSec: g.bankSec ?? null,
    delaySec: g.delaySec ?? null,
    timedOut: g.timedOut ?? false,
  };
}

/**
 * Append a game. With no sessionId a new open session is created (timer flow).
 * Returns the session id so the client can keep adding to it.
 */
export async function addGame(
  sessionId: string | null,
  input: GameInput,
): Promise<ActionResult<{ data: { sessionId: string; gameId: string } }>> {
  const { t } = await getDict();
  const parsed = gameInputSchema.safeParse(input);
  const parsedId = sessionId === null ? null : uuidSchema.safeParse(sessionId);
  if (!parsed.success || (parsedId && !parsedId.success)) {
    return { ok: false, message: t.actions.invalidGame };
  }

  return withContext<{ data: { sessionId: string; gameId: string } }>(async ({ competition, niv, gilad }) => {
    const db = getDb();
    let sid: string;
    if (parsedId?.success) {
      sid = parsedId.data;
      const [existing] = await db
        .select({ id: sessions.id })
        .from(sessions)
        .where(eq(sessions.id, sid));
      if (!existing) return { ok: false, message: t.actions.sessionNotFound };
    } else {
      const [row] = await db
        .insert(sessions)
        .values({ competitionId: competition.id, playedAt: new Date() })
        .returning({ id: sessions.id });
      sid = row.id;
    }

    const [last] = await db
      .select({ position: games.position })
      .from(games)
      .where(eq(games.sessionId, sid))
      .orderBy(desc(games.position))
      .limit(1);

    const [game] = await db
      .insert(games)
      .values({
        ...toRow(parsed.data, { niv: niv.id, gilad: gilad.id }),
        sessionId: sid,
        position: (last?.position ?? 0) + 1,
      })
      .returning({ id: games.id });

    await db
      .update(sessions)
      .set({ updatedAt: new Date() })
      .where(eq(sessions.id, sid));

    revalidateAll();
    return { ok: true, data: { sessionId: sid, gameId: game.id } };
  });
}

export async function updateGame(
  gameId: string,
  input: GameInput,
): Promise<ActionResult> {
  const { t } = await getDict();
  const parsed = gameInputSchema.safeParse(input);
  const parsedId = uuidSchema.safeParse(gameId);
  if (!parsed.success || !parsedId.success) {
    return { ok: false, message: t.actions.invalidGame };
  }
  return withContext<object>(async ({ niv, gilad }) => {
    const db = getDb();
    const row = toRow(parsed.data, { niv: niv.id, gilad: gilad.id });
    const [updated] = await db
      .update(games)
      .set(row)
      .where(eq(games.id, parsedId.data))
      .returning({ sessionId: games.sessionId });
    if (!updated) return { ok: false, message: t.actions.gameNotFound };
    await db
      .update(sessions)
      .set({ updatedAt: new Date() })
      .where(eq(sessions.id, updated.sessionId));
    revalidateAll();
    return { ok: true, message: t.actions.gameUpdated };
  });
}

/** Delete a game and close the gap in positions. */
export async function deleteGame(gameId: string): Promise<ActionResult> {
  const { t } = await getDict();
  const parsedId = uuidSchema.safeParse(gameId);
  if (!parsedId.success) return { ok: false, message: t.actions.invalidId };
  return withContext<object>(async () => {
    const db = getDb();
    const [removed] = await db
      .delete(games)
      .where(eq(games.id, parsedId.data))
      .returning({ sessionId: games.sessionId });
    if (!removed) return { ok: false, message: t.actions.gameNotFound };

    const rest = await db
      .select({ id: games.id })
      .from(games)
      .where(eq(games.sessionId, removed.sessionId))
      .orderBy(asc(games.position));
    for (let i = 0; i < rest.length; i += 1) {
      await db
        .update(games)
        .set({ position: i + 1 })
        .where(eq(games.id, rest[i].id));
    }
    await db
      .update(sessions)
      .set({ updatedAt: new Date() })
      .where(eq(sessions.id, removed.sessionId));
    revalidateAll();
    return { ok: true, message: t.actions.gameDeleted };
  });
}
