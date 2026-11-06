"use client";

import { useActionState } from "react";

import { saveMatch, type SaveMatchState } from "@/actions/match";
import { MAX_TIME_SECONDS } from "@/lib/match-validation";

const initialState: SaveMatchState | undefined = undefined;

export function LogMatchForm() {
  const [state, formAction, pending] = useActionState(saveMatch, initialState);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={formAction}
      className="mx-auto max-w-xl space-y-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] sm:p-6"
    >
      <div>
        <label
          htmlFor="playedAt"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          תאריך משחק
        </label>
        <input
          id="playedAt"
          name="playedAt"
          type="date"
          defaultValue={today}
          required
          className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-3 text-base text-[var(--color-ink)] outline-none transition focus:border-[var(--color-border-strong)] focus:ring-2 focus:ring-[var(--color-focus)]"
        />
        {state && !state.ok && state.fieldErrors?.playedAt ? (
          <p className="mt-1 text-sm text-[var(--color-danger)]" role="alert">
            {state.fieldErrors.playedAt.join(" ")}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="nivScore"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            נקודות ניב
          </label>
          <input
            id="nivScore"
            name="nivScore"
            type="number"
            min={0}
            defaultValue={0}
            required
            className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-3 text-base tabular-nums text-[var(--color-ink)] outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
            dir="ltr"
          />
          {state && !state.ok && state.fieldErrors?.nivScore ? (
            <p className="mt-1 text-sm text-[var(--color-danger)]" role="alert">
              {state.fieldErrors.nivScore.join(" ")}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="giladScore"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            נקודות גלעד
          </label>
          <input
            id="giladScore"
            name="giladScore"
            type="number"
            min={0}
            defaultValue={0}
            required
            className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-3 text-base tabular-nums text-[var(--color-ink)] outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
            dir="ltr"
          />
          {state && !state.ok && state.fieldErrors?.giladScore ? (
            <p className="mt-1 text-sm text-[var(--color-danger)]" role="alert">
              {state.fieldErrors.giladScore.join(" ")}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--color-ink)]">
          זמן שעון שנוצל (כל צד עד {MAX_TIME_SECONDS / 60} דקות)
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="nivTimeUsedSec"
              className="text-xs text-[var(--color-ink-muted)]"
            >
              ניב — שניות
            </label>
            <input
              id="nivTimeUsedSec"
              name="nivTimeUsedSec"
              type="number"
              min={0}
              max={MAX_TIME_SECONDS}
              defaultValue={0}
              required
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-3 text-base tabular-nums outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
              dir="ltr"
            />
          </div>
          <div>
            <label
              htmlFor="giladTimeUsedSec"
              className="text-xs text-[var(--color-ink-muted)]"
            >
              גלעד — שניות
            </label>
            <input
              id="giladTimeUsedSec"
              name="giladTimeUsedSec"
              type="number"
              min={0}
              max={MAX_TIME_SECONDS}
              defaultValue={0}
              required
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-3 text-base tabular-nums outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
              dir="ltr"
            />
          </div>
        </div>
        {(state && !state.ok && state.fieldErrors?.nivTimeUsedSec) ||
        (state && !state.ok && state.fieldErrors?.giladTimeUsedSec) ? (
          <p className="mt-2 text-sm text-[var(--color-danger)]" role="alert">
            {[
              ...(state.fieldErrors?.nivTimeUsedSec ?? []),
              ...(state.fieldErrors?.giladTimeUsedSec ?? []),
            ].join(" ")}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          הערות (אופציונלי)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-3 text-base text-[var(--color-ink)] outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
        />
      </div>

      {state && !state.ok && state.message ? (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {state.message}
        </p>
      ) : null}
      {state?.ok && state.message ? (
        <p className="text-sm text-[var(--color-success)]" role="status">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand)] text-base font-semibold text-[var(--color-surface)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
      >
        {pending ? "שומרים…" : "שמור משחק"}
      </button>
    </form>
  );
}
