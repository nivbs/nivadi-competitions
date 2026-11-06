import { format } from "date-fns";
import { he } from "date-fns/locale";
import { connection } from "next/server";

import { getActiveCompetition, getPlayersBySlug, listMatchesForCompetition } from "@/lib/queries";
import { formatClock } from "@/lib/analysis";

export default async function HistoryPage() {
  await connection();

  if (!process.env.DATABASE_URL) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-[var(--color-ink-muted)]">
          חסר DATABASE_URL. העתיקו מ־‎.env.example ל־‎.env.local והתחברו ל-Neon.
        </p>
      </div>
    );
  }

  const competition = await getActiveCompetition();
  const playersBySlug = await getPlayersBySlug();
  const niv = playersBySlug.niv;
  const gilad = playersBySlug.gilad;

  if (!competition || !niv || !gilad) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-[var(--color-ink-muted)]">
          חסרות תחרות פעילה או שחקנים אותחלו. הריצו מיגרציה ו-seed לפי README.
        </p>
      </div>
    );
  }

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
