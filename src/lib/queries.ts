import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { competitions, matches, players } from "@/db/schema";

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

export async function listMatchesForCompetition(competitionId: string) {
  const db = getDb();
  return db.query.matches.findMany({
    where: eq(matches.competitionId, competitionId),
    orderBy: [desc(matches.playedAt)],
  });
}
