"use client";

import { useI18n } from "@/lib/i18n/client";
import type { PlayerTally } from "@/lib/scoring";

/** Points and games, equal weight, side by side. */
export function ScoreBoard({ niv, gilad }: { niv: PlayerTally; gilad: PlayerTally }) {
  const { t } = useI18n();
  const cell = (label: string, tally: PlayerTally) => (
    <div className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-canvas)] p-3 text-center">
      <p className="text-sm font-medium text-[var(--color-ink-muted)]">{label}</p>
      <p className="mt-1 font-mono text-3xl font-semibold tabular-nums" dir="ltr">
        {tally.points}
        <span className="mx-1 text-base text-[var(--color-ink-faint)]">{t.common.pts}</span>
      </p>
      <p className="font-mono text-sm tabular-nums text-[var(--color-ink-muted)]" dir="ltr">
        {tally.games} {t.common.games}{tally.mars + tally.backgammons > 0 ? ` · ${tally.mars + tally.backgammons} ★` : ""}
      </p>
    </div>
  );
  return (
    <div className="flex gap-3">
      {cell(t.players.niv, niv)}
      {cell(t.players.gilad, gilad)}
    </div>
  );
}
