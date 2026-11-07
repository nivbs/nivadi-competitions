import type { competitions, players } from "@/db/schema";

export type CompetitionContextNotReadyReason =
  | "no_database_url"
  | "schema_missing"
  | "not_seeded";

export type CompetitionContext =
  | { ready: false; reason: CompetitionContextNotReadyReason }
  | {
      ready: true;
      competition: typeof competitions.$inferSelect;
      niv: typeof players.$inferSelect;
      gilad: typeof players.$inferSelect;
    };
