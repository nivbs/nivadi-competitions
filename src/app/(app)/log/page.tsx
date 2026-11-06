import { Suspense } from "react";

import { LogMatchForm } from "@/components/match/LogMatchForm";

export default function LogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
        רישום משחק
      </h1>
      <p className="mt-2 max-w-prose text-[var(--color-ink-muted)]">
        שמרו את תוצאת השש בש, כולל כמה מהזמן נוצל מכל צד בשעון ה-6 דקות.
      </p>
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]" />
          }
        >
          <LogMatchForm />
        </Suspense>
      </div>
    </div>
  );
}
