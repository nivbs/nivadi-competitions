"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { addGame, deleteGame, updateGame } from "@/actions/game";
import { deleteSession, finishSession, updateSession } from "@/actions/session";
import { GameRow } from "@/components/session/GameRow";
import { ScoreBoard } from "@/components/session/ScoreBoard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PlusIcon } from "@/components/ui/icons";
import { useI18n } from "@/lib/i18n/client";
import { PLAYER_SLUGS, summarizeGames, type PlayerSlug, type WinType } from "@/lib/scoring";

export type EditorGame = {
  id: string;
  winner: PlayerSlug;
  winType: WinType;
  nivTimeUsedSec: number | null;
  giladTimeUsedSec: number | null;
  bankSec: number | null;
  delaySec: number | null;
  timedOut: boolean;
};

const field =
  "mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-3 text-base outline-none focus:ring-2 focus:ring-[var(--color-focus)]";

type Props = {
  sessionId: string;
  playedAt: string;
  notes: string;
  finished: boolean;
  games: EditorGame[];
};

export function SessionEditor(props: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [playedAt, setPlayedAt] = useState(props.playedAt);
  const [notes, setNotes] = useState(props.notes);
  const [games, setGames] = useState(props.games);
  const [finished, setFinished] = useState(props.finished);
  const [status, setStatus] = useState<{ text: string; ok: boolean }>();
  const [deleteGameId, setDeleteGameId] = useState<string | null>(null);
  const [confirmSession, setConfirmSession] = useState(false);

  const summary = useMemo(() => summarizeGames(games), [games]);
  const report = (ok: boolean, text: string) => setStatus({ ok, text });

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>, success?: string) =>
    startTransition(async () => {
      const res = await fn();
      report(res.ok, res.ok ? (success ?? res.message ?? t.common.saved) : (res.message ?? t.common.error));
    });

  const toInput = (g: EditorGame) => ({
    winner: g.winner,
    winType: g.winType,
    nivTimeUsedSec: g.nivTimeUsedSec,
    giladTimeUsedSec: g.giladTimeUsedSec,
    bankSec: g.bankSec,
    delaySec: g.delaySec,
    timedOut: g.timedOut,
  });

  const change = (next: EditorGame) => {
    const prev = games;
    setGames((all) => all.map((g) => (g.id === next.id ? next : g)));
    startTransition(async () => {
      const res = await updateGame(next.id, toInput(next));
      if (!res.ok) {
        setGames(prev);
        report(false, res.message);
      } else report(true, t.editor.gameUpdated);
    });
  };

  const add = (winner: PlayerSlug) =>
    startTransition(async () => {
      const res = await addGame(props.sessionId, { winner, winType: "normal" });
      if (!res.ok) return report(false, res.message);
      setGames((all) => [
        ...all,
        {
          id: res.data.gameId,
          winner,
          winType: "normal",
          nivTimeUsedSec: null,
          giladTimeUsedSec: null,
          bankSec: null,
          delaySec: null,
          timedOut: false,
        },
      ]);
      report(true, t.editor.gameAdded);
    });

  const confirmDeleteGame = () => {
    const id = deleteGameId;
    if (!id) return;
    startTransition(async () => {
      const res = await deleteGame(id);
      setDeleteGameId(null);
      if (!res.ok) return report(false, res.message);
      setGames((all) => all.filter((g) => g.id !== id));
      report(true, t.editor.gameDeleted);
    });
  };

  const confirmDeleteSession = () =>
    startTransition(async () => {
      const res = await deleteSession(props.sessionId);
      if (!res.ok) {
        setConfirmSession(false);
        return report(false, res.message);
      }
      router.push("/history");
    });

  return (
    <div className="space-y-6">
      <ScoreBoard niv={summary.niv} gilad={summary.gilad} />

      <section className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div>
          <label htmlFor="playedAt" className="block text-sm font-medium">{t.common.date}</label>
          <input id="playedAt" type="date" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium">{t.common.notes}</label>
          <textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={field} />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => updateSession(props.sessionId, { playedAt, notes }), t.editor.detailsSaved)}
          className="h-11 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-5 font-semibold text-white disabled:opacity-60"
        >
          {t.editor.saveDetails}
        </button>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.editor.games}</h2>
        <ul className="mt-3 space-y-3">
          {games.map((g, i) => (
            <GameRow
              key={g.id}
              index={i}
              game={g}
              busy={pending}
              onChange={(next) => change({ ...g, ...next })}
              onRemove={() => setDeleteGameId(g.id)}
            />
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {PLAYER_SLUGS.map((p) => (
            <button
              key={p}
              type="button"
              disabled={pending}
              onClick={() => add(p)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] font-semibold hover:border-[var(--color-brand)] disabled:opacity-60"
            >
              <PlusIcon width={18} height={18} />
              {t.builder.won(t.players[p])}
            </button>
          ))}
        </div>
      </section>

      {status ? (
        <p className={`text-sm ${status.ok ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`} role="status">
          {status.text}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-4">
        {!finished ? (
          <>
            <Link href={`/timer?session=${props.sessionId}`} className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-4 font-semibold sm:hidden">
              {t.editor.continueTimer}
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(async () => { const r = await finishSession(props.sessionId); if (r.ok) setFinished(true); return r; })}
              className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-4 font-semibold"
            >
              {t.editor.finish}
            </button>
          </>
        ) : null}
        <button type="button" onClick={() => setConfirmSession(true)} className="h-11 rounded-[var(--radius-md)] px-4 font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10">
          {t.editor.deleteSession}
        </button>
      </div>

      <ConfirmDialog
        open={deleteGameId !== null}
        title={t.editor.deleteGameTitle}
        description={t.editor.irreversible}
        pending={pending}
        onConfirm={confirmDeleteGame}
        onCancel={() => setDeleteGameId(null)}
      />
      <ConfirmDialog
        open={confirmSession}
        title={t.editor.deleteSessionTitle}
        description={t.editor.deleteSessionDesc(games.length)}
        pending={pending}
        onConfirm={confirmDeleteSession}
        onCancel={() => setConfirmSession(false)}
      />
    </div>
  );
}
