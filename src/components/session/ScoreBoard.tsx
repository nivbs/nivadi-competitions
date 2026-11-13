"use client";

import { Checker } from "@/components/board/Checker";
import { useI18n } from "@/lib/i18n/client";
import { playerTone } from "@/lib/player-style";
import type { PlayerTally } from "@/lib/scoring";
import type { PlayerSlug } from "@/lib/session/types";

/** Points and games side by side; each side is tinted in its owner's color. */
export function ScoreBoard({ niv, gilad, stacks }: { niv: PlayerTally; gilad: PlayerTally; stacks?: boolean }) {
  const { t } = useI18n();
  const cell = (slug: PlayerSlug, tally: PlayerTally) => (
    <div className={`flex-1 rounded-[var(--radius-md)] p-3 text-center shadow-[var(--shadow-soft)] ${playerTone(slug)}`}>
      <p className="flex items-center justify-center gap-2 font-display text-lg font-bold">
        <Checker player={slug} size={20} aria-hidden />
        {t.players[slug]}
      </p>
      <p className="mt-1 font-mono text-3xl font-semibold tabular-nums" dir="ltr">
        {tally.points}
        <span className="mx-1 text-base opacity-70">{t.common.pts}</span>
      </p>
      <p className="font-mono text-sm tabular-nums opacity-80" dir="ltr">
        {tally.games} {t.common.games}{tally.mars + tally.backgammons > 0 ? ` · ${tally.mars + tally.backgammons} ★` : ""}
      </p>
      {stacks ? (
        <div className="mt-3 flex h-7 items-end justify-center" dir="ltr" aria-hidden>
          {Array.from({ length: Math.min(tally.points, 8) }, (_, i) => (
            <Checker key={i} player={slug} size={24} className={i > 0 ? "-ms-3.5" : ""} />
          ))}
        </div>
      ) : null}
    </div>
  );
  return (
    <div className="flex gap-3">
      {cell("niv", niv)}
      {cell("gilad", gilad)}
    </div>
  );
}
