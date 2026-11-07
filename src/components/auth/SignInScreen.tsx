import type { ReactNode } from "react";

type SignInScreenProps = {
  step: "gate" | "player";
  children: ReactNode;
};

const stepLabels = {
  gate: "כניסה לאתר",
  player: "מי משחק?",
};

export function SignInScreen({ step, children }: SignInScreenProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <p className="text-xs font-medium tracking-wide text-[var(--color-ink-faint)]">
            ניב מול גלעד · שש בש
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
            {stepLabels[step]}
          </h1>
          {step === "player" ? (
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              בחרו מי מחובר כדי לרשום משחקים בשם הנכון.
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              האתר פרטי לניב ולגלעד בלבד.
            </p>
          )}
        </header>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
