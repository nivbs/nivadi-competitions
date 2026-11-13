"use client";

import { useRef } from "react";

import { useAnalysisMotion } from "@/components/analysis/useAnalysisMotion";
import { Checker } from "@/components/board/Checker";
import { PlayerMark } from "@/components/board/PlayerMark";
import { VersusCard, type VersusLabels } from "@/components/session/VersusCard";
import type { Analysis } from "@/lib/analysis";
import { formatClock } from "@/lib/format";

const card =
  "rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] touch-manipulation";

const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)}%`);

export type AnalysisViewProps = {
  analysis: Analysis;
  title: string;
  sessionsGamesLabel: string;
  versusLabels: VersusLabels;
  statLabels: {
    gameWinRateNiv: string;
    sessionWins: string;
    bigWinShare: string;
    avgTime: string;
    timedOut: string;
  };
  footnotes: {
    streak: string;
    pace: string;
    timeLine: string;
    players: { niv: string; gilad: string };
    timedOut: { niv: number; gilad: number };
  };
};

export function AnalysisView({ analysis: a, title, sessionsGamesLabel, versusLabels, statLabels, footnotes }: AnalysisViewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useAnalysisMotion(rootRef);

  const winRatePct = a.nivGameWinRate === null ? null : Math.round(a.nivGameWinRate * 100);
  const nivBigPct = a.nivBigWinShare === null ? null : Math.round(a.nivBigWinShare * 100);
  const giladBigPct = a.giladBigWinShare === null ? null : Math.round(a.giladBigWinShare * 100);

  return (
    <div ref={rootRef} className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 data-analysis-title className="font-display text-3xl font-bold sm:text-4xl">
        {title}
      </h1>
      <p data-analysis-meta className="mt-2 text-[var(--color-ink-muted)]">
        {sessionsGamesLabel}
      </p>

      <div className="mt-8">
        <VersusCard niv={a.niv} gilad={a.gilad} labels={versusLabels} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div data-analysis-stat data-tap-player="niv" className={card} role="group">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">{statLabels.gameWinRateNiv}</p>
          <p
            data-analysis-stat-value
            data-stat-kind="percent"
            data-value={winRatePct ?? ""}
            className="mt-2 font-mono text-3xl font-semibold tabular-nums"
            dir="ltr"
          >
            {pct(a.nivGameWinRate)}
          </p>
        </div>
        <div data-analysis-stat data-tap-player="gilad" className={card} role="group">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">{statLabels.sessionWins}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-3xl font-semibold tabular-nums" dir="ltr">
            <span className="inline-flex items-center gap-1.5">
              <Checker player="niv" size={20} aria-hidden />
              <span data-analysis-stat-value data-stat-kind="int" data-value={a.sessionWins.niv}>
                {a.sessionWins.niv}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Checker player="gilad" size={20} aria-hidden />
              <span data-analysis-stat-value data-stat-kind="int" data-value={a.sessionWins.gilad}>
                {a.sessionWins.gilad}
              </span>
            </span>
            <span className="text-[var(--color-ink-muted)]">
              ={" "}
              <span data-analysis-stat-value data-stat-kind="int" data-value={a.sessionWins.ties}>
                {a.sessionWins.ties}
              </span>
            </span>
          </p>
        </div>
        <div data-analysis-stat data-tap-player="niv" className={card} role="group">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">{statLabels.bigWinShare}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-lg font-medium tabular-nums" dir="ltr">
            <span className="inline-flex items-center gap-1.5">
              <Checker player="niv" size={20} aria-hidden />
              <span
                data-analysis-stat-value
                data-stat-kind="percent"
                data-value={nivBigPct ?? ""}
              >
                {pct(a.nivBigWinShare)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Checker player="gilad" size={20} aria-hidden />
              <span
                data-analysis-stat-value
                data-stat-kind="percent"
                data-value={giladBigPct ?? ""}
              >
                {pct(a.giladBigWinShare)}
              </span>
            </span>
          </p>
        </div>
        <div data-analysis-stat data-tap-player="gilad" className={card} role="group">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">{statLabels.avgTime}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-lg font-medium tabular-nums" dir="ltr">
            <PlayerMark
              player="niv"
              label={a.avgTimeUsedSec.niv !== null ? formatClock(a.avgTimeUsedSec.niv) : "—"}
            />
            <PlayerMark
              player="gilad"
              label={a.avgTimeUsedSec.gilad !== null ? formatClock(a.avgTimeUsedSec.gilad) : "—"}
            />
          </p>
        </div>
      </div>

      <div
        data-analysis-footnotes
        className={`mt-6 space-y-3 text-sm leading-relaxed text-[var(--color-ink-muted)] ${card}`}
      >
        <p>{footnotes.streak}</p>
        <p>{footnotes.pace}</p>
        <p>{footnotes.timeLine}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{statLabels.timedOut}</span>
          <PlayerMark player="niv" label={`${footnotes.players.niv} ${footnotes.timedOut.niv}`} size={16} />
          <PlayerMark player="gilad" label={`${footnotes.players.gilad} ${footnotes.timedOut.gilad}`} size={16} />
        </p>
      </div>
    </div>
  );
}
