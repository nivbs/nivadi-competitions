import { Checker } from "@/components/board/Checker";
import { PlayerMark } from "@/components/board/PlayerMark";
import { DatabaseSetupNotice } from "@/components/shell/DatabaseSetupNotice";
import { VersusCard } from "@/components/session/VersusCard";
import { analyzeSessions } from "@/lib/analysis";
import { loadCompetitionContext } from "@/lib/competition-context/load";
import { formatClock } from "@/lib/format";
import { listSessionsForCompetition } from "@/lib/queries";
import { getDict } from "@/lib/i18n/server";

const card =
  "rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]";
const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)}%`);

export default async function AnalysisPage() {
  const { t } = await getDict();
  const ctx = await loadCompetitionContext();
  if (!ctx.ready) {
    return <DatabaseSetupNotice reason={ctx.reason} />;
  }

  const { competition, niv, gilad } = ctx;
  const sessions = await listSessionsForCompetition(competition.id, { niv: niv.id, gilad: gilad.id });
  const a = analyzeSessions(sessions);

  const gap = Math.abs(a.niv.points - a.gilad.points);
  const lead =
    gap === 0
      ? t.analysis.tied
      : t.analysis.leadsBy(a.niv.points > a.gilad.points ? t.players.niv : t.players.gilad, gap);

  const streak =
    a.streak.owner && a.streak.length > 0
      ? t.analysis.streak(t.players[a.streak.owner], a.streak.length)
      : t.analysis.noGames;
  const pace =
    a.gamesPerWeek !== null ? t.analysis.pace(a.gamesPerWeek) : t.analysis.paceNone;
  const adv = a.avgTimeAdvantageSec;
  const timeLine =
    adv === null
      ? t.analysis.timeNone
      : Math.abs(adv) < 1
        ? t.analysis.timeEqual
        : t.analysis.timeLess(
            adv > 0 ? t.players.niv : t.players.gilad,
            formatClock(Math.abs(Math.round(adv))),
          );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.analysis.title}</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {t.home.sessionsGames(a.totalSessions, a.totalGames)}
      </p>

      <div className="mt-8">
        <VersusCard
          niv={a.niv}
          gilad={a.gilad}
          labels={{
            niv: t.players.niv,
            gilad: t.players.gilad,
            vs: t.analysis.vs,
            pts: t.common.pts,
            rows: { wins: t.common.games, mars: t.winTypes.mars, backgammon: t.winTypes.backgammon },
            summary: lead,
          }}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className={card}>
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">{t.analysis.gameWinRateNiv}</p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums" dir="ltr">{pct(a.nivGameWinRate)}</p>
        </div>
        <div className={card}>
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">{t.analysis.sessionWins}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-3xl font-semibold tabular-nums" dir="ltr">
            <span className="inline-flex items-center gap-1.5"><Checker player="niv" size={20} aria-hidden />{a.sessionWins.niv}</span>
            <span className="inline-flex items-center gap-1.5"><Checker player="gilad" size={20} aria-hidden />{a.sessionWins.gilad}</span>
            <span className="text-[var(--color-ink-muted)]">= {a.sessionWins.ties}</span>
          </p>
        </div>
        <div className={card}>
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">{t.analysis.bigWinShare}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-lg font-medium tabular-nums" dir="ltr">
            <PlayerMark player="niv" label={pct(a.nivBigWinShare)} />
            <PlayerMark player="gilad" label={pct(a.giladBigWinShare)} />
          </p>
        </div>
        <div className={card}>
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">{t.analysis.avgTime}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-lg font-medium tabular-nums" dir="ltr">
            <PlayerMark player="niv" label={a.avgTimeUsedSec.niv !== null ? formatClock(a.avgTimeUsedSec.niv) : "—"} />
            <PlayerMark player="gilad" label={a.avgTimeUsedSec.gilad !== null ? formatClock(a.avgTimeUsedSec.gilad) : "—"} />
          </p>
        </div>
      </div>

      <div className={`mt-6 space-y-3 text-sm leading-relaxed text-[var(--color-ink-muted)] ${card}`}>
        <p>{streak}</p>
        <p>{pace}</p>
        <p>{timeLine}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{t.analysis.timedOut}</span>
          <PlayerMark player="niv" label={`${t.players.niv} ${a.timedOut.niv}`} size={16} />
          <PlayerMark player="gilad" label={`${t.players.gilad} ${a.timedOut.gilad}`} size={16} />
        </p>
      </div>
    </div>
  );
}
