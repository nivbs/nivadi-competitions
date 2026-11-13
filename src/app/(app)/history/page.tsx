import { format } from "date-fns";
import Link from "next/link";

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
      <h1 className="text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
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
                  <span className="text-sm text-[var(--color-brand)]">
                    {!s.finishedAt ? t.history.openPrefix : ""}
                    {leader ? t.common.leads(t.players[leader]) : t.common.tie}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-center tabular-nums" dir="ltr">
                  <div>
                    <p className="text-xs text-[var(--color-ink-muted)]">{t.players.niv}</p>
                    <p className="font-mono text-2xl font-semibold">
                      {n.points}
                      <span className="text-xs font-normal text-[var(--color-ink-muted)]"> {t.common.pts} · {n.games} {t.common.gamesShort}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-ink-muted)]">{t.players.gilad}</p>
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
