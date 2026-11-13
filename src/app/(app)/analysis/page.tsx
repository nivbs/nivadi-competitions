import { AnalysisView } from "@/components/analysis/AnalysisView";
import { DatabaseSetupNotice } from "@/components/shell/DatabaseSetupNotice";
import { analyzeSessions } from "@/lib/analysis";
import { loadCompetitionContext } from "@/lib/competition-context/load";
import { formatClock } from "@/lib/format";
import { listSessionsForCompetition } from "@/lib/queries";
import { getDict } from "@/lib/i18n/server";

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
  const pace = a.gamesPerWeek !== null ? t.analysis.pace(a.gamesPerWeek) : t.analysis.paceNone;
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
    <AnalysisView
      analysis={a}
      title={t.analysis.title}
      sessionsGamesLabel={t.home.sessionsGames(a.totalSessions, a.totalGames)}
      versusLabels={{
        niv: t.players.niv,
        gilad: t.players.gilad,
        vs: t.analysis.vs,
        pts: t.common.pts,
        rows: { wins: t.common.games, mars: t.winTypes.mars, backgammon: t.winTypes.backgammon },
        summary: lead,
      }}
      statLabels={{
        gameWinRateNiv: t.analysis.gameWinRateNiv,
        sessionWins: t.analysis.sessionWins,
        bigWinShare: t.analysis.bigWinShare,
        timedOut: t.analysis.timedOut,
      }}
      footnotes={{
        streak,
        pace,
        timeLine,
        players: { niv: t.players.niv, gilad: t.players.gilad },
        timedOut: a.timedOut,
      }}
    />
  );
}
