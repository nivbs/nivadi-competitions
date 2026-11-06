import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

let cachedDb: Db | null = null;

export function getDb(): Db {
  if (cachedDb) {
    return cachedDb;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.",
    );
  }
  cachedDb = drizzle(neon(url), { schema });
  return cachedDb;
}
