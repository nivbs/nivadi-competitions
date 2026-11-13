"use client";

import { CrownIcon } from "@/components/ui/icons";
import { useI18n } from "@/lib/i18n/client";
import type { PlayerSlug, WinType } from "@/lib/scoring";

/** One game as a chip: winner initial, with M (Mars) / B (backgammon) marker. */
export function GameBadge({ winner, winType }: { winner: PlayerSlug; winType: WinType }) {
  const { t } = useI18n();
  const mark = winType === "mars" ? "M" : winType === "backgammon" ? "B" : null;
  const tone =
    winner === "niv"
      ? "bg-[var(--color-brand)] text-white"
      : "bg-[var(--color-inlay-dark)] text-white";
  return (
    <span
      className={`inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold ${tone}`}
      title={`${t.players[winner]}${mark ? ` · ${t.winTypes[winType]}` : ""}`}
    >
      {t.players[winner]}
      {mark ? (
        <span className="rounded-full bg-[var(--color-accent)] px-1.5 text-[0.65rem] text-[var(--color-ink)]">
          {mark}
        </span>
      ) : (
        <CrownIcon width={12} height={12} className="opacity-70" />
      )}
    </span>
  );
}
