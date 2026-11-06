"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { matches } from "@/db/schema";
import { assertEnvPlayerMapping, getPlayerSlugForClerkUser } from "@/lib/auth-players";
import { matchFormSchema } from "@/lib/match-validation";
import { getActiveCompetition, getPlayersBySlug } from "@/lib/queries";

export type SaveMatchState =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function saveMatch(
  _prevState: SaveMatchState | undefined,
  formData: FormData,
): Promise<SaveMatchState> {
  assertEnvPlayerMapping();

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "צריך להתחבר כדי לשמור משחק." };
  }
  const playerSlug = getPlayerSlugForClerkUser(userId);
  if (!playerSlug) {
    return {
      ok: false,
      message:
        "החשבון שלך לא ממופה לניב או גלעד. הגדירו NIV_CLERK_USER_ID ו-GILAD_CLERK_USER_ID בסביבה.",
    };
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

  const competition = await getActiveCompetition();
  if (!competition) {
    return { ok: false, message: "אין תחרות פעילה במסד הנתונים." };
  }

  const playersBySlug = await getPlayersBySlug();
  const niv = playersBySlug.niv;
  const gilad = playersBySlug.gilad;
  if (!niv || !gilad) {
    return {
      ok: false,
      message: "שחקנים לא אותחלו. הריצו npm run db:seed לאחר המיגרציה.",
    };
  }

  let winnerPlayerId: string | null = null;
  if (data.nivScore > data.giladScore) {
    winnerPlayerId = niv.id;
  } else if (data.giladScore > data.nivScore) {
    winnerPlayerId = gilad.id;
  }

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
