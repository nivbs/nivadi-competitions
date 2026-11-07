"use client";

import { signOutAction, switchPlayerAction } from "@/actions/auth";
import { PLAYER_DISPLAY, type PlayerSlug } from "@/lib/session/types";

type UserMenuProps = {
  playerSlug: PlayerSlug;
};

export function UserMenu({ playerSlug }: UserMenuProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="hidden text-sm font-medium text-[var(--color-ink-muted)] sm:inline">
        {PLAYER_DISPLAY[playerSlug]}
      </span>
      <form action={switchPlayerAction}>
        <button
          type="submit"
          className="rounded-md px-2 py-1.5 text-xs font-medium text-[var(--color-ink-muted)] transition hover:bg-[var(--color-border)]/40 hover:text-[var(--color-ink)]"
        >
          החלף שחקן
        </button>
      </form>
      <form action={signOutAction}>
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-2 py-1.5 text-xs font-medium text-[var(--color-ink)] transition hover:border-[var(--color-border-strong)]"
        >
          יציאה
        </button>
      </form>
    </div>
  );
}
