import Link from "next/link";

import { Die } from "@/components/board/Die";
import { StarDivider } from "@/components/board/StarDivider";
import { DatabaseSetupNotice } from "@/components/shell/DatabaseSetupNotice";
import { GameBadge } from "@/components/ui/GameBadge";
import { CrownIcon } from "@/components/ui/icons";
import { ScoreBoard } from "@/components/session/ScoreBoard";
import { analyzeSessions } from "@/lib/analysis";
import { loadCompetitionContext } from "@/lib/competition-context/load";
import { isDatabaseSetupError } from "@/lib/db-errors";
import { listSessionsForCompetition, type SessionView } from "@/lib/queries";
import { getDict } from "@/lib/i18n/server";

const primary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-5 text-base font-semibold text-[var(--color-surface)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--color-brand-hover)]";
const secondary =
  "inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-base font-semibold text-[var(--color-ink)] shadow-[var(--shadow-soft)] transition hover:border-[var(--color-brand)]";

export default async function HomePage() {
  const { t } = await getDict();
  const ctx = await loadCompetitionContext();
  if (!ctx.ready) {
    return <DatabaseSetupNotice reason={ctx.reason} />;
  }

  const { competition, niv, gilad } = ctx;
  let sessions: SessionView[];
  try {
    sessions = await listSessionsForCompetition(competition.id, { niv: niv.id, gilad: gilad.id });
  } catch (error) {
    if (isDatabaseSetupError(error)) {
      return <DatabaseSetupNotice reason="schema_missing" />;
    }
    throw error;
  }
  const a = analyzeSessions(sessions);
  const latest = sessions[0];
  const open = sessions.find((s) => !s.finishedAt);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
          {t.app.competitionTitle}
        </h1>
        <span className="flex shrink-0 gap-2" dir="ltr" aria-hidden>
          <Die face={6} size={40} style={{ transform: "rotate(-8deg)" }} />
          <Die face={5} size={40} style={{ transform: "rotate(7deg)" }} />
        </span>
      </div>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {t.home.sessionsGames(a.totalSessions, a.totalGames)}
        {a.streak.owner ? t.home.streak(t.players[a.streak.owner], a.streak.length) : ""}
      </p>

      <div className="mt-6">
        <ScoreBoard niv={a.niv} gilad={a.gilad} stacks />
      </div>

      <StarDivider className="mt-6" />

      {latest ? (
        <Link
          href={`/history/${latest.id}`}
          className="mt-6 block rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)]"
        >
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">{t.home.latest}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {latest.games.map((g) => (
              <GameBadge key={g.id} winner={g.winner} winType={g.winType} />
            ))}
          </div>
        </Link>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={open ? `/timer?session=${open.id}` : "/timer"} className={`${primary} sm:hidden`}>
          <CrownIcon width={22} height={22} />
          {open ? t.home.resumeTimer : t.home.startTimer}
        </Link>
        <Link href="/log" className={secondary}>
          {t.nav.log}
        </Link>
        <Link href="/history" className={secondary}>
          {t.nav.history}
        </Link>
      </div>
    </div>
  );
}
