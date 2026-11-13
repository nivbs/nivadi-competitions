"use client";

import { useFx } from "@/components/motion/FxProvider";
import type { DieFace } from "@/components/board/Die";
import { signOutAction, switchPlayerAction } from "@/actions/auth";
import { Checker } from "@/components/board/Checker";
import { LogOutIcon } from "@/components/ui/icons";
import { useI18n } from "@/lib/i18n/client";
import type { PlayerSlug } from "@/lib/session/types";

type UserMenuProps = {
  playerSlug: PlayerSlug;
};

export function UserMenu({ playerSlug }: UserMenuProps) {
  const { t } = useI18n();
  const fx = useFx();
  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-cream)]">
        <Checker player={playerSlug} size={22} aria-hidden />
        <span className="hidden sm:inline">{t.players[playerSlug]}</span>
      </span>
      <form action={switchPlayerAction}>
        <button
          type="submit"
          onClick={() => fx({ kind: "reroll", face: ((Math.floor(Math.random() * 6) + 1) as DieFace) })}
          className="rounded-md px-1.5 py-1.5 text-xs font-medium text-[var(--color-cream-muted)] transition hover:bg-white/10 hover:text-[var(--color-gold)]"
        >
          {t.auth.switchPlayer}
        </button>
      </form>
      <form action={signOutAction}>
        <button
          type="submit"
          aria-label={t.auth.signOut}
          title={t.auth.signOut}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-gold)]/60 text-[var(--color-cream)] transition hover:bg-white/10 hover:text-[var(--color-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
        >
          <LogOutIcon width={18} height={18} />
        </button>
      </form>
    </div>
  );
}
