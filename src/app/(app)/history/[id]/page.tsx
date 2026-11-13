import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SessionEditor } from "@/components/session/SessionEditor";
import { DatabaseSetupNotice } from "@/components/shell/DatabaseSetupNotice";
import { loadCompetitionContext } from "@/lib/competition-context/load";
import { dateFnsLocale, getDict } from "@/lib/i18n/server";
import { getSession } from "@/lib/queries";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, t } = await getDict();
  const ctx = await loadCompetitionContext();
  if (!ctx.ready) {
    return <DatabaseSetupNotice reason={ctx.reason} />;
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const session = await getSession(id, { niv: ctx.niv.id, gilad: ctx.gilad.id });
  if (!session) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <Link href="/history" className="text-sm font-medium text-[var(--color-brand)]">
        {t.history.back}
      </Link>
      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
        {format(session.playedAt, "EEEE d MMM yyyy", { locale: dateFnsLocale(locale) })}
      </h1>
      {!session.finishedAt ? (
        <p className="mt-1 text-sm text-[var(--color-brand)]">{t.history.openSession}</p>
      ) : null}
      <div className="mt-6">
        <SessionEditor
          sessionId={session.id}
          playedAt={session.playedAt.toISOString().slice(0, 10)}
          notes={session.notes ?? ""}
          finished={session.finishedAt !== null}
          games={session.games.map((g) => ({
            id: g.id,
            winner: g.winner,
            winType: g.winType,
            nivTimeUsedSec: g.nivTimeUsedSec,
            giladTimeUsedSec: g.giladTimeUsedSec,
            bankSec: g.bankSec,
            delaySec: g.delaySec,
            timedOut: g.timedOut,
          }))}
        />
      </div>
    </div>
  );
}
