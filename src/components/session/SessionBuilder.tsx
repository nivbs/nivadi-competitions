"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { createSession } from "@/actions/session";
import { GameRow, type EditableGame } from "@/components/session/GameRow";
import { ScoreBoard } from "@/components/session/ScoreBoard";
import { PlusIcon } from "@/components/ui/icons";
import { useI18n } from "@/lib/i18n/client";
import { PLAYER_SLUGS, summarizeGames, type PlayerSlug } from "@/lib/scoring";

const field =
  "mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-3 text-base text-[var(--color-ink)] outline-none focus:ring-2 focus:ring-[var(--color-focus)]";

export function SessionBuilder() {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [playedAt, setPlayedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [games, setGames] = useState<EditableGame[]>([]);
  const [error, setError] = useState<string>();

  const summary = useMemo(() => summarizeGames(games), [games]);

  const add = (winner: PlayerSlug) =>
    setGames((g) => [...g, { winner, winType: "normal" }]);

  const submit = () => {
    setError(undefined);
    startTransition(async () => {
      const res = await createSession({
        playedAt,
        notes,
        games: games.map((g) => ({ winner: g.winner, winType: g.winType })),
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.push(`/history/${res.data.id}`);
    });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div>
        <label htmlFor="playedAt" className="block text-sm font-medium">
          {t.common.date}
        </label>
        <input id="playedAt" type="date" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} className={field} />
      </div>

      <div>
        <p className="text-sm font-medium">{t.builder.whoWon}</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {PLAYER_SLUGS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => add(p)}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-canvas)] text-base font-semibold hover:border-[var(--color-brand)]"
            >
              <PlusIcon width={20} height={20} />
              {t.builder.won(t.players[p])}
            </button>
          ))}
        </div>
      </div>

      {games.length > 0 ? (
        <ul className="space-y-3">
          {games.map((g, i) => (
            <GameRow
              key={i}
              index={i}
              game={g}
              onChange={(next) => setGames((all) => all.map((x, j) => (j === i ? next : x)))}
              onRemove={() => setGames((all) => all.filter((_, j) => j !== i))}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-[var(--radius-sm)] bg-[var(--color-canvas)] px-3 py-4 text-center text-sm text-[var(--color-ink-muted)]">
          {t.builder.empty}
        </p>
      )}

      <ScoreBoard niv={summary.niv} gilad={summary.gilad} />

      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          {t.builder.notesOptional}
        </label>
        <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={field} />
      </div>

      {error ? (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={pending || games.length === 0}
        className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand)] text-base font-semibold text-[var(--color-surface)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? t.builder.saving : t.builder.save}
      </button>
    </div>
  );
}
