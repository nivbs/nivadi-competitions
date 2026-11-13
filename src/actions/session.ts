"use server";

import { eq } from "drizzle-orm";

import { getDict } from "@/lib/i18n/server";
import { getDb } from "@/db";
import { games, sessions } from "@/db/schema";
import {
  playedAtToDate,
  revalidateAll,
  withContext,
  type ActionResult,
} from "@/actions/guard";
import {
  sessionInputSchema,
  sessionMetaSchema,
  uuidSchema,
  type SessionInput,
} from "@/lib/validation/session";

/** Create a finished session with its games (manual log). */
export async function createSession(
  input: SessionInput,
): Promise<ActionResult<{ data: { id: string } }>> {
  const { t } = await getDict();
  const parsed = sessionInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: t.actions.validation[parsed.error.issues[0]?.message ?? ""] ?? t.actions.fixFields,
    };
  }
  const data = parsed.data;

  return withContext<{ data: { id: string } }>(async ({ competition, niv, gilad }) => {
    const db = getDb();
    const now = new Date();
    const [row] = await db
      .insert(sessions)
      .values({
        competitionId: competition.id,
        playedAt: playedAtToDate(data.playedAt),
        notes: data.notes,
        finishedAt: now,
      })
      .returning({ id: sessions.id });

    await db.insert(games).values(
      data.games.map((g, i) => ({
        sessionId: row.id,
        position: i + 1,
        winnerPlayerId: g.winner === "niv" ? niv.id : gilad.id,
        winType: g.winType,
        nivTimeUsedSec: g.nivTimeUsedSec ?? null,
        giladTimeUsedSec: g.giladTimeUsedSec ?? null,
        bankSec: g.bankSec ?? null,
        delaySec: g.delaySec ?? null,
        timedOut: g.timedOut ?? false,
      })),
    );

    revalidateAll();
    return { ok: true, message: t.actions.sessionSaved, data: { id: row.id } };
  });
}

export async function updateSession(
  id: string,
  input: { playedAt: string; notes?: string | null },
): Promise<ActionResult> {
  const { t } = await getDict();
  const parsedId = uuidSchema.safeParse(id);
  const parsed = sessionMetaSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { ok: false, message: t.actions.fixFields };
  }
  return withContext<object>(async () => {
    await getDb()
      .update(sessions)
      .set({
        playedAt: playedAtToDate(parsed.data.playedAt),
        notes: parsed.data.notes,
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, parsedId.data));
    revalidateAll();
    return { ok: true, message: t.actions.updated };
  });
}

export async function finishSession(id: string): Promise<ActionResult> {
  const { t } = await getDict();
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: t.actions.invalidId };
  return withContext<object>(async () => {
    await getDb()
      .update(sessions)
      .set({ finishedAt: new Date(), updatedAt: new Date() })
      .where(eq(sessions.id, parsedId.data));
    revalidateAll();
    return { ok: true, message: t.actions.sessionFinished };
  });
}

export async function deleteSession(id: string): Promise<ActionResult> {
  const { t } = await getDict();
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: t.actions.invalidId };
  return withContext<object>(async () => {
    await getDb().delete(sessions).where(eq(sessions.id, parsedId.data));
    revalidateAll();
    return { ok: true, message: t.actions.sessionDeleted };
  });
}
