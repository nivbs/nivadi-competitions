import {
  boolean,
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
});

export const competitions = pgTable("competitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  gameType: gameTypeEnum("game_type").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  status: competitionStatusEnum("status").notNull().default("active"),
});

export const winTypeEnum = pgEnum("win_type", [
  "normal",
  "mars",
  "backgammon",
]);

/** A sitting: several games played in a row. Score is derived from games. */
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    playedAt: timestamp("played_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
    /** Null while a timer session is still open. */
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("sessions_competition_played_idx").on(t.competitionId, t.playedAt),
  ],
);

export const games = pgTable(
  "games",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    winnerPlayerId: uuid("winner_player_id")
      .notNull()
      .references(() => players.id),
    winType: winTypeEnum("win_type").notNull().default("normal"),
    nivTimeUsedSec: integer("niv_time_used_sec"),
    giladTimeUsedSec: integer("gilad_time_used_sec"),
    bankSec: integer("bank_sec"),
    delaySec: integer("delay_sec"),
    timedOut: boolean("timed_out").notNull().default(false),
    endedAt: timestamp("ended_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("games_session_position_idx").on(t.sessionId, t.position)],
);
