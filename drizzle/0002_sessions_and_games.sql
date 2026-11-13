CREATE TYPE "public"."win_type" AS ENUM('normal', 'mars', 'backgammon');--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"winner_player_id" uuid NOT NULL,
	"win_type" "win_type" DEFAULT 'normal' NOT NULL,
	"niv_time_used_sec" integer,
	"gilad_time_used_sec" integer,
	"bank_sec" integer,
	"delay_sec" integer,
	"timed_out" boolean DEFAULT false NOT NULL,
	"ended_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"played_at" timestamp with time zone NOT NULL,
	"notes" text,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "matches" CASCADE;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_winner_player_id_players_id_fk" FOREIGN KEY ("winner_player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "games_session_position_idx" ON "games" USING btree ("session_id","position");--> statement-breakpoint
CREATE INDEX "sessions_competition_played_idx" ON "sessions" USING btree ("competition_id","played_at");