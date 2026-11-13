import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/shell/LanguageSwitcher";
import { getDict } from "@/lib/i18n/server";

type SignInScreenProps = {
  step: "gate" | "player";
  children: ReactNode;
};

export async function SignInScreen({ step, children }: SignInScreenProps) {
  const { t } = await getDict();
  const stepLabels = {
    gate: t.auth.signInTitle,
    player: t.auth.whoPlays,
  };
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <LanguageSwitcher />
        </div>
        <header className="mb-8 text-center">
          <p className="text-xs font-medium tracking-wide text-[var(--color-ink-faint)]">
            {t.meta.title}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
            {stepLabels[step]}
          </h1>
          {step === "player" ? (
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              {t.auth.pickPlayer}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              {t.auth.privateSite}
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
