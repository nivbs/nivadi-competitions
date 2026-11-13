import { z } from "zod";

import { WIN_TYPES } from "@/lib/scoring";

const playerSlug = z.enum(["niv", "gilad"]);
const optionalSeconds = z
  .number()
  .int()
  .min(0)
  .max(60 * 60 * 3)
  .nullish();

export const gameInputSchema = z.object({
  winner: playerSlug,
  winType: z.enum(WIN_TYPES),
  nivTimeUsedSec: optionalSeconds,
  giladTimeUsedSec: optionalSeconds,
  bankSec: optionalSeconds,
  delaySec: optionalSeconds,
  timedOut: z.boolean().optional(),
});
export type GameInput = z.infer<typeof gameInputSchema>;

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "date_required");
const notes = z
  .string()
  .max(2000)
  .nullish()
  .transform((v) => (v && v.trim() ? v.trim() : null));

export const sessionInputSchema = z.object({
  playedAt: dateString,
  notes,
  games: z.array(gameInputSchema).min(1, "games_min").max(100),
});
export type SessionInput = z.input<typeof sessionInputSchema>;

export const sessionMetaSchema = z.object({
  playedAt: dateString,
  notes,
});

export const uuidSchema = z.string().uuid();
