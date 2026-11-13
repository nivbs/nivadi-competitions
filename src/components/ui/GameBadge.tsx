"use client";

import { Checker } from "@/components/board/Checker";
import { useI18n } from "@/lib/i18n/client";
import { WIN_POINTS, type PlayerSlug, type WinType } from "@/lib/scoring";

/**
 * One game as a chip: the winner's checkers (1 normal, 2 gammon, 3 backgammon),
 * stacked in the winner's color (Niv dark, Gilad light).
 */
export function GameBadge({ winner, winType }: { winner: PlayerSlug; winType: WinType }) {
  const { t } = useI18n();
  const count = WIN_POINTS[winType];
  return (
    <span
      className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] ps-2 pe-3 text-xs font-semibold text-[var(--color-ink)]"
      title={`${t.players[winner]}${winType !== "normal" ? ` · ${t.winTypes[winType]}` : ""}`}
    >
      <span className="flex items-center" dir="ltr" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <Checker key={i} player={winner} size={20} className={i > 0 ? "-ms-2.5" : ""} />
        ))}
      </span>
      {t.players[winner]}
    </span>
  );
}
