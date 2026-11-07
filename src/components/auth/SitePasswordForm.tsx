"use client";

import { useActionState } from "react";

import {
  verifySitePasswordAction,
  type PasswordGateState,
} from "@/actions/auth";

const initialState: PasswordGateState | undefined = undefined;

export function SitePasswordForm() {
  const [state, formAction, pending] = useActionState(
    verifySitePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          סיסמת אתר
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-3 text-base text-[var(--color-ink)] outline-none transition focus:border-[var(--color-border-strong)] focus:ring-2 focus:ring-[var(--color-focus)]"
          dir="ltr"
        />
        {state && !state.ok ? (
          <p className="mt-2 text-sm text-[var(--color-danger)]" role="alert">
            {state.message}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-4 py-3 text-base font-semibold text-[var(--color-surface)] transition hover:bg-[var(--color-brand-hover)] disabled:opacity-60"
      >
        {pending ? "בודק…" : "המשך"}
      </button>
    </form>
  );
}
