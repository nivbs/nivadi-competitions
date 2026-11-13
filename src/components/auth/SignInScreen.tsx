import type { ReactNode } from "react";

import { BoardFrame } from "@/components/board/BoardFrame";
import { Die } from "@/components/board/Die";
import { DoublingCube } from "@/components/board/DoublingCube";
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
    <div className="wood flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <LanguageSwitcher />
        </div>
        <div className="mb-6 flex items-end justify-center gap-4" dir="ltr" aria-hidden>
          <Die face={6} size={56} style={{ transform: "rotate(-9deg)" }} />
          <DoublingCube value={64} size={44} style={{ transform: "translateY(-6px)" }} />
          <Die face={5} size={56} style={{ transform: "rotate(8deg)" }} />
        </div>
        <BoardFrame>
          <header className="mb-6 text-center">
            <p className="text-sm font-medium text-[var(--color-ink-faint)]">{t.meta.title}</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-[var(--color-ink)]">
              {stepLabels[step]}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              {step === "player" ? t.auth.pickPlayer : t.auth.privateSite}
            </p>
          </header>
          {children}
        </BoardFrame>
      </div>
    </div>
  );
}
