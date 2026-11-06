import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const gameTypeEnum = pgEnum("game_type", ["backgammon"]);

export const competitionStatusEnum = pgEnum("competition_status", [
  "active",
  "completed",
]);

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  clerkUserId: text("clerk_user_id"),
});

export const competitions = pgTable("competitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  gameType: gameTypeEnum("game_type").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  status: competitionStatusEnum("status").notNull().default("active"),
});

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    playedAt: timestamp("played_at", { withTimezone: true }).notNull(),
    nivScore: integer("niv_score").notNull(),
    giladScore: integer("gilad_score").notNull(),
    winnerPlayerId: uuid("winner_player_id").references(() => players.id),
    nivTimeUsedSec: integer("niv_time_used_sec").notNull(),
    giladTimeUsedSec: integer("gilad_time_used_sec").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    competitionPlayedIdx: index("matches_competition_played_idx").on(
      t.competitionId,
      t.playedAt,
    ),
  }),
);
