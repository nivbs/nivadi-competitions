import { readFileSync } from "node:fs";

import { config } from "dotenv";
import { sql } from "drizzle-orm";

import { getDb } from "../src/db";

config();
config({ path: ".env.local", override: true });

async function main() {
  const db = getDb();
  const file = readFileSync("drizzle/0002_sessions_and_games.sql", "utf8");
  const stmts = file
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of stmts) {
    try {
      await db.execute(sql.raw(statement));
      console.log("OK", statement.slice(0, 60).replace(/\n/g, " "));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log("ERR", msg.slice(0, 160));
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
