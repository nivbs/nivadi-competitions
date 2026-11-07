"use server";

import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { matches } from "@/db/schema";
import { loadCompetitionContext } from "@/lib/competition-context/load";
import { isDatabaseSetupError } from "@/lib/db-errors";
import { getPlayerSlugFromSession } from "@/lib/session/player";
import { matchFormSchema } from "@/lib/match-validation";

export type SaveMatchState =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function saveMatch(
  _prevState: SaveMatchState | undefined,
  formData: FormData,
): Promise<SaveMatchState> {
  const playerSlug = await getPlayerSlugFromSession();
  if (!playerSlug) {
    return { ok: false, message: "צריך לבחור שחקן כדי לשמור משחק." };
  }

  const parsed = matchFormSchema.safeParse({
    playedAt: String(formData.get("playedAt") ?? ""),
    nivScore: formData.get("nivScore"),
    giladScore: formData.get("giladScore"),
    nivTimeUsedSec: formData.get("nivTimeUsedSec"),
    giladTimeUsedSec: formData.get("giladTimeUsedSec"),
    notes: (() => {
      const v = formData.get("notes");
      if (v === null || v === "") {
        return undefined;
      }
      return String(v);
    })(),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "נא לתקן את השדות המסומנים.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const playedAt = new Date(data.playedAt);
  if (Number.isNaN(playedAt.getTime())) {
    return { ok: false, message: "תאריך לא תקין." };
  }

  let ctx;
  try {
    ctx = await loadCompetitionContext();
  } catch (error) {
    if (isDatabaseSetupError(error)) {
      return {
        ok: false,
        message:
          "מסד הנתונים עדיין לא מוכן. הריצו db:push ו-db:seed (ראו הודעה בדף הבית).",
      };
    }
    throw error;
  }

  if (!ctx.ready) {
    return {
      ok: false,
      message:
        ctx.reason === "not_seeded"
          ? "שחקנים לא אותחלו. הריצו npm run db:seed לאחר המיגרציה."
          : "מסד הנתונים עדיין לא מוכן. הריצו db:push ו-db:seed (ראו הודעה בדף הבית).",
    };
  }

  const { competition, niv, gilad } = ctx;

  let winnerPlayerId: string | null = null;
  if (data.nivScore > data.giladScore) {
    winnerPlayerId = niv.id;
  } else if (data.giladScore > data.nivScore) {
    winnerPlayerId = gilad.id;
  }

  try {
    const db = getDb();
    await db.insert(matches).values({
      competitionId: competition.id,
      playedAt,
      nivScore: data.nivScore,
      giladScore: data.giladScore,
      winnerPlayerId,
      nivTimeUsedSec: data.nivTimeUsedSec,
      giladTimeUsedSec: data.giladTimeUsedSec,
      notes: data.notes,
    });
  } catch (error) {
    if (isDatabaseSetupError(error)) {
      return {
        ok: false,
        message: "מסד הנתונים עדיין לא מוכן. הריצו db:push ו-db:seed (ראו הודעה בדף הבית).",
      };
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/log");
  revalidatePath("/history");
  revalidatePath("/analysis");

  return {
    ok: true,
    message:
      playerSlug === "niv"
        ? "נרשם משחק. יאללה ניב!"
        : "נרשם משחק. יאללה גלעד!",
  };
}
