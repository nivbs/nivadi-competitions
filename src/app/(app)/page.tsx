import Link from "next/link";
import { connection } from "next/server";

import { analyzeMatches, formatClock } from "@/lib/analysis";
import { getActiveCompetition, getPlayersBySlug, listMatchesForCompetition } from "@/lib/queries";

export default async function HomePage() {
  await connection();

  if (!process.env.DATABASE_URL) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">שש בש</h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          הגדירו DATABASE_URL בקובץ ‎.env.local (ראו ‎.env.example) והריצו מיגרציה כדי לטעון נתונים.
        </p>
      </div>
    );
  }

  const competition = await getActiveCompetition();
  const playersBySlug = await getPlayersBySlug();
  const niv = playersBySlug.niv;
  const gilad = playersBySlug.gilad;

  let headline = "טוען נתונים…";
  let sub = "חברו את מסד הנתונים כדי לראות את הלוח.";
  let nivWins = 0;
  let giladWins = 0;
  let winrateLine: string | null = null;

  if (competition && niv && gilad) {
    const matchRows = await listMatchesForCompetition(competition.id);
    const a = analyzeMatches(matchRows, {
      nivPlayerId: niv.id,
      giladPlayerId: gilad.id,
    });
    headline = competition.title;
    sub = `${a.totalMatches} משחקים רשומים · זמן שעון: עד ${formatClock(360)} לכל שחקן`;
    nivWins = a.nivWins;
    giladWins = a.giladWins;
    if (a.nivWinRate !== null) {
      winrateLine = `אחוזי ניצחון (בלי תיקו): ניב ${Math.round(a.nivWinRate * 100)}% · גלעד ${Math.round((1 - a.nivWinRate) * 100)}%`;
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
        {headline}
      </h1>
      <p className="mt-2 max-w-prose text-[var(--color-ink-muted)]">{sub}</p>

      {competition && niv && gilad ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-medium text-[var(--color-ink-muted)]">
              ניצחונות ניב
            </p>
            <p
              className="mt-2 font-mono text-4xl font-semibold tabular-nums text-[var(--color-ink)]"
              dir="ltr"
            >
              {nivWins}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-medium text-[var(--color-ink-muted)]">
              ניצחונות גלעד
            </p>
            <p
              className="mt-2 font-mono text-4xl font-semibold tabular-nums text-[var(--color-ink)]"
              dir="ltr"
            >
              {giladWins}
            </p>
          </div>
        </div>
      ) : null}

      {winrateLine ? (
        <p className="mt-6 text-sm text-[var(--color-ink-muted)]">{winrateLine}</p>
      ) : null}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/log"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand)] px-5 text-base font-semibold text-[var(--color-surface)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--color-brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          רשום משחק
        </Link>
        <Link
          href="/history"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-base font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          לכל המשחקים
        </Link>
      </div>
    </div>
  );
}
