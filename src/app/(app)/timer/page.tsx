import { TimerClient, type ResumeSession } from "@/components/timer/TimerClient";
import { DatabaseSetupNotice } from "@/components/shell/DatabaseSetupNotice";
import { loadCompetitionContext } from "@/lib/competition-context/load";
import { getSession } from "@/lib/queries";

export default async function TimerPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const ctx = await loadCompetitionContext();
  if (!ctx.ready) {
    return <DatabaseSetupNotice reason={ctx.reason} />;
  }

  const { session: sessionId } = await searchParams;
  let resume: ResumeSession | null = null;
  if (sessionId && /^[0-9a-f-]{36}$/i.test(sessionId)) {
    const s = await getSession(sessionId, { niv: ctx.niv.id, gilad: ctx.gilad.id });
    if (s && !s.finishedAt) {
      resume = {
        id: s.id,
        games: s.games.map((g) => ({ id: g.id, winner: g.winner, winType: g.winType })),
      };
    }
  }

  return <TimerClient resume={resume} />;
}
