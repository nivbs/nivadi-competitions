import { config } from "dotenv";

// Neon CLI pulls into .env.local; Next.js loads both. Match that for Drizzle CLI.
config();
config({ path: ".env.local", override: true });

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
