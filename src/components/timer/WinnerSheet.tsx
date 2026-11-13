"use client";

import { useEffect, useId, useState } from "react";

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
  onAbortGame?: () => void;
};

export function WinnerSheet({ open, presetWinner, timedOutNote, pending, error, onClose, onSave, onAbortGame }: Props) {
  const { t } = useI18n();
  const titleId = useId();
  const [picked, setPicked] = useState<PlayerSlug | null>(null);
  const winner = picked ?? presetWinner;
  const title = winner ? t.winnerSheet.how(t.players[winner]) : t.winnerSheet.who;
  // Gilad reads the top half upside down. His win sheet sits in that half and turns with him.
  const faceGilad = winner === "gilad";

  const close = () => {
    setPicked(null);
    onClose();
  };

  useEffect(() => {
    if (!open || !faceGilad) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPicked(null);
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, faceGilad, onClose]);

  const body = (
    <>
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
        <div className={faceGilad ? "space-y-1.5" : "space-y-3"}>
          {WIN_TYPES.map((w) => (
            <button
              key={w}
              type="button"
              disabled={pending}
              onClick={() => onSave(winner, w)}
              className={`flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-start hover:border-[var(--color-brand)] disabled:opacity-60 ${faceGilad ? "py-2" : "py-3"}`}
            >
              <Die face={WIN_POINTS[w] as 1 | 2 | 3} size={faceGilad ? 32 : 36} />
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
      {onAbortGame ? (
        <button
          type="button"
          onClick={onAbortGame}
          disabled={pending}
          className={`${faceGilad ? "mt-2" : "mt-4"} h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] text-sm font-semibold text-[var(--color-ink-muted)] disabled:opacity-60`}
        >
          {t.winnerSheet.cancelGame}
        </button>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );

  if (!open) return null;

  if (faceGilad) {
    return (
      <>
        <button
          type="button"
          aria-label={t.common.close}
          className="z-30 col-start-1 row-start-1 row-span-3 bg-[var(--color-walnut-deep)]/70"
          onClick={close}
        />
        <div className="pointer-events-none z-40 col-start-1 row-start-1 flex min-h-0 rotate-180 flex-col">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="pointer-events-auto mt-auto max-h-full min-h-0 overscroll-contain overflow-y-auto rounded-t-[var(--radius-lg)] border-t-4 border-[var(--color-gold)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-die)]"
          >
            <h2 id={titleId} className="font-display text-xl leading-tight text-[var(--color-ink)]">
              {title}
            </h2>
            <div className="mt-2">{body}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <BottomSheet open={open} title={title} onClose={close}>
      {body}
    </BottomSheet>
  );
}
