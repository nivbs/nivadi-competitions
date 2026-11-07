import { io } from "next/cache";

import type { CompetitionContext } from "@/lib/competition-context/types";
import { isDatabaseSetupError } from "@/lib/db-errors";
import { getActiveCompetition, getPlayersBySlug } from "@/lib/queries";

export async function loadCompetitionContext(): Promise<CompetitionContext> {
  await io();

  if (!process.env.DATABASE_URL?.trim()) {
    return { ready: false, reason: "no_database_url" };
  }

  try {
    const competition = await getActiveCompetition();
    const playersBySlug = await getPlayersBySlug();
    const niv = playersBySlug.niv;
    const gilad = playersBySlug.gilad;

    if (!competition || !niv || !gilad) {
      return { ready: false, reason: "not_seeded" };
    }

    return { ready: true, competition, niv, gilad };
  } catch (error) {
    if (isDatabaseSetupError(error)) {
      return { ready: false, reason: "schema_missing" };
    }
    throw error;
  }
}
