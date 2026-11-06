import { z } from "zod";

/** Each side has 6 minutes on the clock in שש בש sessions. */
export const MAX_TIME_SECONDS = 360;

export const matchFormSchema = z.object({
  playedAt: z.string().min(1, "בחרו תאריך"),
  nivScore: z.coerce.number().int().min(0),
  giladScore: z.coerce.number().int().min(0),
  nivTimeUsedSec: z.coerce
    .number()
    .int()
    .min(0, "מינימום 0 שניות")
    .max(MAX_TIME_SECONDS, "עד 6 דקות (360 שניות)"),
  giladTimeUsedSec: z.coerce
    .number()
    .int()
    .min(0, "מינימום 0 שניות")
    .max(MAX_TIME_SECONDS, "עד 6 דקות (360 שניות)"),
  notes: z.string().max(2000).optional(),
});

export type MatchFormInput = z.infer<typeof matchFormSchema>;
