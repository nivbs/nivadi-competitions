CREATE TYPE "public"."competition_status" AS ENUM('active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."game_type" AS ENUM('backgammon');--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"game_type" "game_type" NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"status" "competition_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"played_at" timestamp with time zone NOT NULL,
	"niv_score" integer NOT NULL,
	"gilad_score" integer NOT NULL,
	"winner_player_id" uuid,
	"niv_time_used_sec" integer NOT NULL,
	"gilad_time_used_sec" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"clerk_user_id" text,
	CONSTRAINT "players_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_player_id_players_id_fk" FOREIGN KEY ("winner_player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "matches_competition_played_idx" ON "matches" USING btree ("competition_id","played_at");