import { revalidatePath } from "next/cache";

import { loadCompetitionContext } from "@/lib/competition-context/load";
import { isDatabaseSetupError } from "@/lib/db-errors";
import { getDict } from "@/lib/i18n/server";
import { getPlayerSlugFromSession } from "@/lib/session/player";

export type ActionResult<T extends object = object> =
  | ({ ok: true; message?: string } & T)
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

type ReadyContext = Extract<
  Awaited<ReturnType<typeof loadCompetitionContext>>,
  { ready: true }
>;

/**
 * Shared guard for server actions: requires a signed-in player and a ready
 * database, and turns DB setup errors into friendly messages.
 */
export async function withContext<T extends object = object>(
  fn: (ctx: ReadyContext) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const { t } = await getDict();
  const player = await getPlayerSlugFromSession();
  if (!player) {
    return { ok: false, message: t.actions.needPlayer };
  }
  try {
    const ctx = await loadCompetitionContext();
    if (!ctx.ready) {
      return {
        ok: false,
        message:
          ctx.reason === "not_seeded"
            ? t.actions.notSeeded
            : t.actions.dbNotReady,
      };
    }
    return await fn(ctx);
  } catch (error) {
    if (isDatabaseSetupError(error)) {
      return { ok: false, message: t.actions.dbNotReady };
    }
    throw error;
  }
}

export function revalidateAll() {
  for (const p of ["/", "/log", "/history", "/analysis", "/timer"]) {
    revalidatePath(p);
  }
}

export function playedAtToDate(value: string): Date {
  return new Date(`${value.slice(0, 10)}T12:00:00.000Z`);
}
