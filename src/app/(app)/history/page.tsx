import { format } from "date-fns";
import { he } from "date-fns/locale";

import { DatabaseSetupNotice } from "@/components/shell/DatabaseSetupNotice";
import { formatClock } from "@/lib/analysis";
import { loadCompetitionContext } from "@/lib/competition-context/load";
import { listMatchesForCompetition } from "@/lib/queries";

export default async function HistoryPage() {
  const ctx = await loadCompetitionContext();
  if (!ctx.ready) {
    return <DatabaseSetupNotice reason={ctx.reason} />;
  }

  const { competition, niv, gilad } = ctx;
  const rows = await listMatchesForCompetition(competition.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
        היסטוריית משחקים
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {rows.length === 0
          ? "עדיין אין משחקים. הוסיפו מהרישום."
          : `${rows.length} משחקים בתחרות ${competition.title}`}
      </p>

      <ul className="mt-8 space-y-3">
        {rows.map((m) => {
          let resultHe = "תיקו";
          if (m.winnerPlayerId === niv.id) {
            resultHe = "ניצחון ניב";
          } else if (m.winnerPlayerId === gilad.id) {
            resultHe = "ניצחון גלעד";
          }
          return (
            <li
              key={m.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 shadow-[var(--shadow-soft)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <time
                  className="text-sm font-medium text-[var(--color-ink)]"
                  dateTime={m.playedAt.toISOString()}
                >
                  {format(m.playedAt, "EEEE d MMM yyyy", { locale: he })}
                </time>
                <span className="text-sm text-[var(--color-brand)]">{resultHe}</span>
              </div>
              <div
                className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm tabular-nums text-[var(--color-ink-muted)]"
                dir="ltr"
              >
                <span>
                  ניב {m.nivScore}–{m.giladScore} גלעד
                </span>
                <span>
                  שעון ניב {formatClock(m.nivTimeUsedSec)} · גלעד{" "}
                  {formatClock(m.giladTimeUsedSec)}
                </span>
              </div>
              {m.notes ? (
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{m.notes}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
