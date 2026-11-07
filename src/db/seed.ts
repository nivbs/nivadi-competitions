import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });

import { eq } from "drizzle-orm";

import { getDb } from "./index";
import { competitions, players } from "./schema";

async function seed() {
  const db = getDb();

  await db
    .insert(players)
    .values({
      slug: "niv",
      displayName: "Niv",
    })
    .onConflictDoNothing({ target: players.slug });

  await db
    .insert(players)
    .values({
      slug: "gilad",
      displayName: "Gilad",
    })
    .onConflictDoNothing({ target: players.slug });

  const existing = await db.query.competitions.findFirst({
    where: eq(competitions.title, "שש בש"),
  });

  if (!existing) {
    await db.insert(competitions).values({
      title: "שש בש",
      gameType: "backgammon",
      startsAt: new Date(),
      status: "active",
    });
  }

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
