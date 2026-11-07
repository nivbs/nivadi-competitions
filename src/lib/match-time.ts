import { MAX_TIME_SECONDS } from "@/lib/match-validation";

export const DEFAULT_CLOCK_USED_SECONDS = MAX_TIME_SECONDS;

export function splitClockSeconds(totalSec: number): {
  minutes: number;
  seconds: number;
} {
  const clamped = Math.min(MAX_TIME_SECONDS, Math.max(0, Math.floor(totalSec)));
  return {
    minutes: Math.floor(clamped / 60),
    seconds: clamped % 60,
  };
}

export function combineClockParts(minutes: number, seconds: number): number {
  const m = Math.min(6, Math.max(0, Math.floor(minutes)));
  let s = Math.min(59, Math.max(0, Math.floor(seconds)));
  if (m === 6) {
    s = 0;
  }
  const total = m * 60 + s;
  return Math.min(MAX_TIME_SECONDS, total);
}

export function formatClockMmSs(totalSec: number): string {
  const { minutes, seconds } = splitClockSeconds(totalSec);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
