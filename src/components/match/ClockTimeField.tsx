"use client";

import { useCallback, useMemo, useState } from "react";

import type { ClockTimeFieldProps } from "@/components/match/types";
import {
  combineClockParts,
  DEFAULT_CLOCK_USED_SECONDS,
  splitClockSeconds,
} from "@/lib/match-time";
import { MAX_TIME_SECONDS } from "@/lib/match-validation";

const fieldClass =
  "min-h-[3rem] w-full min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-3 text-center text-lg font-semibold tabular-nums text-[var(--color-ink)] outline-none transition focus:border-[var(--color-border-strong)] focus:ring-2 focus:ring-[var(--color-focus)]";

export function ClockTimeField({
  idPrefix,
  name,
  playerLabel,
  defaultTotalSec = DEFAULT_CLOCK_USED_SECONDS,
  error,
}: ClockTimeFieldProps) {
  const initial = useMemo(
    () => splitClockSeconds(defaultTotalSec),
    [defaultTotalSec],
  );
  const [minutes, setMinutes] = useState(initial.minutes);
  const [seconds, setSeconds] = useState(initial.seconds);

  const totalSec = combineClockParts(minutes, seconds);

  const applyMinutes = useCallback((raw: number) => {
    const nextMinutes = Number.isFinite(raw)
      ? Math.min(6, Math.max(0, Math.floor(raw)))
      : 0;
    setMinutes(nextMinutes);
    if (nextMinutes === 6) {
      setSeconds(0);
    }
  }, []);

  const applySeconds = useCallback(
    (raw: number) => {
      const nextSeconds = Number.isFinite(raw)
        ? Math.min(59, Math.max(0, Math.floor(raw)))
        : 0;
      const combined = combineClockParts(minutes, nextSeconds);
      const parts = splitClockSeconds(combined);
      setMinutes(parts.minutes);
      setSeconds(parts.seconds);
    },
    [minutes],
  );

  const setFullClock = useCallback(() => {
    setMinutes(6);
    setSeconds(0);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--color-ink-muted)]">
          {playerLabel}
        </span>
        <button
          type="button"
          onClick={setFullClock}
          className="rounded-md px-2 py-1 text-xs font-medium text-[var(--color-brand)] underline-offset-2 transition hover:text-[var(--color-brand-hover)] hover:underline"
        >
          שעון מלא (6:00)
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2" dir="ltr">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${idPrefix}-min`} className="sr-only">
            דקות — {playerLabel}
          </label>
          <input
            id={`${idPrefix}-min`}
            type="number"
            inputMode="numeric"
            min={0}
            max={6}
            value={minutes}
            onChange={(e) => applyMinutes(e.target.valueAsNumber)}
            aria-describedby={`${idPrefix}-hint`}
            className={fieldClass}
          />
          <span className="mt-1 block text-center text-[0.65rem] text-[var(--color-ink-faint)]">
            דק׳
          </span>
        </div>
        <span
          className="pb-5 text-2xl font-semibold tabular-nums text-[var(--color-ink-muted)]"
          aria-hidden
        >
          :
        </span>
        <div className="min-w-0 flex-1">
          <label htmlFor={`${idPrefix}-sec`} className="sr-only">
            שניות — {playerLabel}
          </label>
          <input
            id={`${idPrefix}-sec`}
            type="number"
            inputMode="numeric"
            min={0}
            max={minutes >= 6 ? 0 : 59}
            value={seconds}
            disabled={minutes >= 6}
            onChange={(e) => applySeconds(e.target.valueAsNumber)}
            className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-50`}
          />
          <span className="mt-1 block text-center text-[0.65rem] text-[var(--color-ink-faint)]">
            שנ׳
          </span>
        </div>
      </div>
      <p
        id={`${idPrefix}-hint`}
        className="mt-1 text-center text-xs tabular-nums text-[var(--color-ink-faint)]"
        dir="ltr"
      >
        = {totalSec}s · מקס׳ {MAX_TIME_SECONDS / 60}:00
      </p>
      <input type="hidden" name={name} value={totalSec} />
      {error ? (
        <p className="mt-1 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
