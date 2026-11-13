"use client";

import { useState } from "react";

import { Checker } from "@/components/board/Checker";
import { Die } from "@/components/board/Die";
import { playerTone } from "@/lib/player-style";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useI18n } from "@/lib/i18n/client";
import { CrownIcon } from "@/components/ui/icons";
import {
  PLAYER_SLUGS,
  WIN_POINTS,
  WIN_TYPES,
  type PlayerSlug,
  type WinType,
} from "@/lib/scoring";

type Props = {
  open: boolean;
  /** Preselect (e.g. the opponent of a flagged player). */
  presetWinner: PlayerSlug | null;
  timedOutNote?: string;
  pending: boolean;
  error?: string;
  onClose: () => void;
  onSave: (winner: PlayerSlug, type: WinType) => void;
};

export function WinnerSheet({ open, presetWinner, timedOutNote, pending, error, onClose, onSave }: Props) {
  const { t } = useI18n();
  const [picked, setPicked] = useState<PlayerSlug | null>(null);
  const winner = picked ?? presetWinner;

  const close = () => {
    setPicked(null);
    onClose();
  };

  return (
    <BottomSheet open={open} title={winner ? t.winnerSheet.how(t.players[winner]) : t.winnerSheet.who} onClose={close}>
      {timedOutNote ? (
        <p className="mb-3 rounded-[var(--radius-sm)] bg-[var(--color-gold)]/25 px-3 py-2 text-sm text-[var(--color-ink)]">
          {timedOutNote}
        </p>
      ) : null}

      {!winner ? (
        <div className="grid grid-cols-2 gap-3">
          {PLAYER_SLUGS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPicked(p)}
              className={`flex h-28 flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] font-display text-xl font-bold shadow-[var(--shadow-soft)] transition active:scale-[0.97] ${playerTone(p)}`}
            >
              <Checker player={p} size={40}>
                <CrownIcon width={22} height={22} className={p === "niv" ? "text-[var(--color-gold)]" : "text-[var(--color-accent-muted)]"} />
              </Checker>
              {t.players[p]}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {WIN_TYPES.map((w) => (
            <button
              key={w}
              type="button"
              disabled={pending}
              onClick={() => onSave(winner, w)}
              className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3 text-start hover:border-[var(--color-brand)] disabled:opacity-60"
            >
              <Die face={WIN_POINTS[w] as 1 | 2 | 3} size={36} />
              <span className="flex-1">
                <span className="block text-base font-semibold">{t.winTypes[w]}</span>
                <span className="block text-xs text-[var(--color-ink-muted)]">{t.winHints[w]}</span>
              </span>
              <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-sm font-bold text-[var(--color-ink)] ring-1 ring-[var(--color-accent-muted)]">
                {WIN_POINTS[w]} {t.common.pts}
              </span>
            </button>
          ))}
          {picked || !presetWinner ? (
            <button type="button" onClick={() => setPicked(null)} className="h-11 w-full text-sm font-medium text-[var(--color-ink-muted)]">
              {t.winnerSheet.change}
            </button>
          ) : null}
        </div>
      )}
      {error ? (
        <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </BottomSheet>
  );
}
