import { format } from "date-fns";
import Link from "next/link";

import { Checker } from "@/components/board/Checker";
import { PlayerMark } from "@/components/board/PlayerMark";
import { GameBadge } from "@/components/ui/GameBadge";
import { DatabaseSetupNotice } from "@/components/shell/DatabaseSetupNotice";
import { loadCompetitionContext } from "@/lib/competition-context/load";
import { listSessionsForCompetition } from "@/lib/queries";
import { dateFnsLocale, getDict } from "@/lib/i18n/server";

export default async function HistoryPage() {
  const { locale, t } = await getDict();
  const ctx = await loadCompetitionContext();
  if (!ctx.ready) {
    return <DatabaseSetupNotice reason={ctx.reason} />;
  }

  const { competition, niv, gilad } = ctx;
  const rows = await listSessionsForCompetition(competition.id, {
    niv: niv.id,
    gilad: gilad.id,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
        {t.history.title}
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {rows.length === 0
          ? t.history.empty
          : t.history.count(rows.length, t.app.competitionTitle)}
      </p>

      <ul className="mt-8 space-y-3">
        {rows.map((s) => {
          const { niv: n, gilad: g, leader } = s.summary;
          return (
            <li key={s.id}>
              <Link
                href={`/history/${s.id}`}
                className="block rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 shadow-[var(--shadow-soft)] transition hover:border-[var(--color-brand)]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <time className="text-sm font-medium" dateTime={s.playedAt.toISOString()}>
                    {format(s.playedAt, "EEEE d MMM yyyy", { locale: dateFnsLocale(locale) })}
                  </time>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                    {!s.finishedAt ? t.history.openPrefix : ""}
                    {leader ? <Checker player={leader} size={16} aria-hidden /> : null}
                    {leader ? t.common.leads(t.players[leader]) : t.common.tie}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-center tabular-nums" dir="ltr">
                  <div>
                    <PlayerMark player="niv" label={t.players.niv} size={14} className="text-xs text-[var(--color-ink-muted)]" />
                    <p className="font-mono text-2xl font-semibold">
                      {n.points}
                      <span className="text-xs font-normal text-[var(--color-ink-muted)]"> {t.common.pts} · {n.games} {t.common.gamesShort}</span>
                    </p>
                  </div>
                  <div>
                    <PlayerMark player="gilad" label={t.players.gilad} size={14} className="text-xs text-[var(--color-ink-muted)]" />
                    <p className="font-mono text-2xl font-semibold">
                      {g.points}
                      <span className="text-xs font-normal text-[var(--color-ink-muted)]"> {t.common.pts} · {g.games} {t.common.gamesShort}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.games.map((game) => (
                    <GameBadge key={game.id} winner={game.winner} winType={game.winType} />
                  ))}
                </div>
                {s.notes ? (
                  <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{s.notes}</p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
