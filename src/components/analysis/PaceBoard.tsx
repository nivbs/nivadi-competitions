"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Checker } from "@/components/board/Checker";
import { PlayerMark } from "@/components/board/PlayerMark";
import { Segmented } from "@/components/ui/Segmented";
import type { FasterPlayer, Pace, PaceGrain, PacePoint } from "@/lib/analysis";
import { paceChangePct } from "@/lib/analysis";
import { formatClock } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";
import type { PlayerSlug } from "@/lib/session/types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const card =
  "rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)] touch-manipulation sm:p-5";

const VW = 360;
const VH = 156;
const PLOT = { l: 40, r: 8, t: 10, b: 22 };
const FLAT_PCT = 8;

const GRAINS: PaceGrain[] = ["session", "day", "game"];

function axisMax(values: number[]): number {
  const padded = Math.max(...values, 1) * 1.18;
  const step = padded <= 60 ? 15 : padded <= 180 ? 30 : 60;
  return Math.max(step, Math.ceil(padded / step) * step);
}

function xAt(i: number, n: number): number {
  const inner = VW - PLOT.l - PLOT.r;
  if (n <= 1) return PLOT.l + inner / 2;
  return PLOT.l + (i / (n - 1)) * inner;
}

function yAt(sec: number, max: number): number {
  const inner = VH - PLOT.t - PLOT.b;
  return PLOT.t + (1 - sec / max) * inner;
}

function linePath(key: "nivSec" | "giladSec", points: PacePoint[], max: number): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i, points.length).toFixed(1)} ${yAt(p[key], max).toFixed(1)}`)
    .join(" ");
}

function formatWhen(at: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
    day: "numeric",
    month: "numeric",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(at));
}

function openingGrain(pace: Pace): PaceGrain {
  if (pace.session.length >= 2) return "session";
  if (pace.day.length >= 2) return "day";
  return "game";
}

function anchor(i: number, n: number): "start" | "middle" | "end" {
  if (n === 1 || (i > 0 && i < n - 1)) return "middle";
  return i === 0 ? "start" : "end";
}

export function PaceBoard({
  faster,
  pace,
  avgNiv,
  avgGilad,
}: {
  faster: FasterPlayer | null;
  pace: Pace;
  avgNiv: number | null;
  avgGilad: number | null;
}) {
  const { locale, t } = useI18n();
  const rootRef = useRef<HTMLElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<() => void>(() => {});
  const dragRef = useRef<{ x: number; y: number; axis: "x" | "y" | null } | null>(null);

  const [grain, setGrain] = useState<PaceGrain>(() => openingGrain(pace));
  const [index, setIndex] = useState(Number.POSITIVE_INFINITY);

  const points = pace[grain];
  const safe = points.length ? Math.min(index, points.length - 1) : 0;
  const point = points[safe];

  useGSAP(
    (_ctx, contextSafe) => {
      const root = rootRef.current;
      if (!root || avgNiv == null || avgGilad == null) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          mobile: "(max-width: 639px)",
        },
        (ctx) => {
          const reduce = Boolean(ctx.conditions?.reduceMotion);
          const mobile = Boolean(ctx.conditions?.mobile);
          const nivEl = root.querySelector<HTMLElement>("[data-pace-checker='niv']");
          const giladEl = root.querySelector<HTMLElement>("[data-pace-checker='gilad']");
          const pctEl = root.querySelector<HTMLElement>("[data-pace-pct]");
          if (!nivEl || !giladEl) return;

          const travel = () => {
            const lane = root.querySelector<HTMLElement>("[data-pace-lane]");
            const distance = Math.max(0, (lane?.clientWidth ?? 0) - 58);
            return getComputedStyle(root).direction === "rtl" ? -distance : distance;
          };
          const park = () => gsap.set([nivEl, giladEl], { x: travel() });

          if (reduce) {
            park();
            replayRef.current = park;
            return;
          }

          const maxT = Math.max(avgNiv, avgGilad, 1);
          const slowDur = mobile ? 1.15 : 1.45;
          const nivDur = Math.max(0.42, slowDur * (avgNiv / maxT));
          const giladDur = Math.max(0.42, slowDur * (avgGilad / maxT));
          const fastDur = Math.min(nivDur, giladDur);
          const fastPiece = (avgNiv <= avgGilad ? nivEl : giladEl).querySelector("[data-pace-piece]");

          const tl = gsap.timeline({ paused: true });
          tl.fromTo(nivEl, { x: 0 }, { x: travel, duration: nivDur, ease: "power2.out" }, 0);
          tl.fromTo(giladEl, { x: 0 }, { x: travel, duration: giladDur, ease: "power2.out" }, 0);
          if (fastPiece && faster) {
            tl.to(fastPiece, { scale: 1.16, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, fastDur);
          }
          if (pctEl) {
            tl.fromTo(
              pctEl,
              { scale: 1 },
              { scale: 1.08, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "center center" },
              fastDur,
            );
          }

          const race = root.querySelector("[data-pace-race]") ?? root;
          const start = mobile ? "top 92%" : "top 84%";
          const play = () => {
            if (tl.progress() === 0) tl.play();
          };
          ScrollTrigger.create({
            trigger: race,
            start,
            once: true,
            onEnter: play,
          });
          requestAnimationFrame(() => {
            if (race.getBoundingClientRect().top < window.innerHeight * (mobile ? 0.92 : 0.84)) play();
          });

          const replay = () => tl.restart();
          replayRef.current = contextSafe ? contextSafe(replay) : replay;

          const onResize = () => {
            if (tl.progress() === 1) park();
          };
          window.addEventListener("resize", onResize);
          return () => window.removeEventListener("resize", onResize);
        },
      );

      return () => {
        replayRef.current = () => {};
        mm.revert();
      };
    },
    { scope: rootRef, dependencies: [avgNiv, avgGilad, faster?.player, locale], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const paths = gsap.utils.toArray<SVGPathElement>("[data-pace-line]", chartRef.current);
        if (ctx.conditions?.reduceMotion || paths.length === 0) return;
        paths.forEach((path, i) => {
          const len = path.getTotalLength();
          gsap.fromTo(
            path,
            { strokeDasharray: len, strokeDashoffset: len },
            {
              strokeDashoffset: 0,
              duration: 0.7,
              delay: i * 0.06,
              ease: "power2.out",
              overwrite: true,
              scrollTrigger: {
                trigger: chartRef.current,
                start: "top 92%",
                once: true,
              },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: chartRef, dependencies: [grain], revertOnUpdate: true },
  );

  if (avgNiv == null || avgGilad == null || points.length === 0 || !point) return null;

  const max = axisMax(points.flatMap((p) => [p.nivSec, p.giladSec]));
  const ticks = [max, max / 2, 0];
  const labelAt = points.length <= 4 ? points.map((_, i) => i) : [0, points.length - 1];
  const when = formatWhen(point.at, locale);
  const pointLabel = grain === "game" ? `${t.analysis.pacePoint(safe + 1)} · ${when}` : when;

  const pick = (clientX: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return;
    const px = ((clientX - rect.left) / rect.width) * VW;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < points.length; i += 1) {
      const d = Math.abs(xAt(i, points.length) - px);
      if (d < bestD) {
        best = i;
        bestD = d;
      }
    }
    setIndex(best);
  };

  const trends = (["niv", "gilad"] as const).map((player) => {
    const change = paceChangePct(points.map((p) => (player === "niv" ? p.nivSec : p.giladSec)));
    if (change == null) return null;
    const rounded = Math.round(change);
    if (Math.abs(rounded) < FLAT_PCT) return { player, kind: "flat" as const, pct: 0 };
    if (rounded < 0) return { player, kind: "quicker" as const, pct: Math.abs(rounded) };
    return { player, kind: "slower" as const, pct: rounded };
  });

  return (
    <section ref={rootRef} className={`${card} mt-4 max-sm:mx-auto max-sm:max-w-md`} aria-labelledby="pace-heading">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="pace-heading" className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 sm:justify-start">
          {faster ? (
            <>
              <span className="font-display text-2xl">{t.analysis.fasterBy(t.players[faster.player])}</span>
              <span
                data-pace-pct
                className="inline-block font-mono text-3xl font-semibold tabular-nums text-[var(--color-accent-muted)]"
                dir="ltr"
              >
                {faster.byPct}%
              </span>
            </>
          ) : (
            <span className="font-display text-2xl">{t.analysis.fasterTied}</span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => replayRef.current()}
          className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-4 text-sm font-semibold"
        >
          {t.analysis.raceAgain}
        </button>
      </div>

      <div data-pace-race className="mt-4 space-y-3">
        <Lane player="niv" clock={formatClock(avgNiv)} ahead={faster?.player === "niv"} name={t.players.niv} />
        <Lane player="gilad" clock={formatClock(avgGilad)} ahead={faster?.player === "gilad"} name={t.players.gilad} />
      </div>

      <div className="mt-5">
        <Segmented
          name={t.analysis.paceGrain}
          value={grain}
          onChange={(next) => {
            setGrain(next);
            setIndex(Number.POSITIVE_INFINITY);
          }}
          options={GRAINS.map((g) => ({
            value: g,
            label: g === "game" ? t.analysis.grainGame : g === "session" ? t.analysis.grainSession : t.analysis.grainDay,
          }))}
        />
      </div>

      <div
        ref={chartRef}
        dir="ltr"
        role="slider"
        tabIndex={0}
        aria-label={t.analysis.paceChart}
        aria-valuemin={1}
        aria-valuemax={points.length}
        aria-valuenow={safe + 1}
        aria-valuetext={`${pointLabel}, ${t.players.niv} ${formatClock(point.nivSec)}, ${t.players.gilad} ${formatClock(point.giladSec)}`}
        aria-orientation="horizontal"
        className="mt-4 select-none rounded-[var(--radius-sm)]"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            setIndex(Math.min(points.length - 1, safe + 1));
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            setIndex(Math.max(0, safe - 1));
          } else if (e.key === "Home") {
            e.preventDefault();
            setIndex(0);
          } else if (e.key === "End") {
            e.preventDefault();
            setIndex(points.length - 1);
          }
        }}
      >
        <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
          <span className="font-mono text-[0.8125rem] text-[var(--color-ink-muted)]">{pointLabel}</span>
          <span className="inline-flex items-center gap-1 font-mono font-semibold tabular-nums">
            <Checker player="niv" size={14} aria-hidden />
            {formatClock(point.nivSec)}
          </span>
          <span className="inline-flex items-center gap-1 font-mono font-semibold tabular-nums">
            <Checker player="gilad" size={14} aria-hidden />
            {formatClock(point.giladSec)}
          </span>
        </div>
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="block w-full touch-pan-y"
          aria-hidden
          onPointerDown={(e) => {
            dragRef.current = { x: e.clientX, y: e.clientY, axis: null };
          }}
          onPointerMove={(e) => {
            const drag = dragRef.current;
            if (!drag) return;
            if (!drag.axis) {
              const dx = Math.abs(e.clientX - drag.x);
              const dy = Math.abs(e.clientY - drag.y);
              if (dx < 6 && dy < 6) return;
              drag.axis = dx > dy ? "x" : "y";
              if (drag.axis === "x") e.currentTarget.setPointerCapture(e.pointerId);
            }
            if (drag.axis === "x") pick(e.clientX, e.currentTarget);
          }}
          onPointerUp={(e) => {
            const drag = dragRef.current;
            dragRef.current = null;
            if (drag?.axis === "y") return;
            pick(e.clientX, e.currentTarget);
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PLOT.l}
                x2={VW - PLOT.r}
                y1={yAt(tick, max)}
                y2={yAt(tick, max)}
                stroke="var(--color-border)"
                strokeWidth="1"
              />
              <text
                x={PLOT.l - 6}
                y={yAt(tick, max) + 3}
                textAnchor="end"
                fill="var(--color-ink-faint)"
                fontSize="11"
                className="font-mono"
              >
                {formatClock(tick)}
              </text>
            </g>
          ))}
          <line
            x1={xAt(safe, points.length)}
            x2={xAt(safe, points.length)}
            y1={PLOT.t}
            y2={VH - PLOT.b}
            stroke="var(--color-gold)"
            strokeWidth="1.5"
          />
          {points.length > 1 ? (
            <>
              <path
                data-pace-line
                d={linePath("giladSec", points, max)}
                fill="none"
                stroke="var(--player-gilad-edge)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                data-pace-line
                d={linePath("nivSec", points, max)}
                fill="none"
                stroke="var(--player-niv-fill)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </>
          ) : null}
          {points.map((p, i) => (
            <g key={p.id}>
              <circle cx={xAt(i, points.length)} cy={yAt(p.giladSec, max)} r={i === safe ? 5 : 3.5} fill="var(--player-gilad-edge)" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx={xAt(i, points.length)} cy={yAt(p.nivSec, max)} r={i === safe ? 5 : 3.5} fill="var(--player-niv-fill)" stroke="var(--color-surface)" strokeWidth="1.5" />
            </g>
          ))}
          {labelAt.map((i) => (
            <text
              key={points[i].id}
              x={xAt(i, points.length)}
              y={VH - 4}
              textAnchor={anchor(i, points.length)}
              fill="var(--color-ink-faint)"
              fontSize="11"
              className="font-mono"
            >
              {formatWhen(points[i].at, locale)}
            </text>
          ))}
        </svg>
        {points.length > 1 ? (
          <p className="mt-1 text-center text-[0.8125rem] text-[var(--color-ink-faint)] sm:text-start">{t.analysis.paceScrub}</p>
        ) : null}
      </div>

      {points.length < 2 ? (
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{t.analysis.trendNeed}</p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm sm:justify-start">
          {trends.map((trend) => {
            if (!trend) return null;
            const label =
              trend.kind === "quicker"
                ? t.analysis.trendQuicker(trend.pct)
                : trend.kind === "slower"
                  ? t.analysis.trendSlower(trend.pct)
                  : t.analysis.trendFlat;
            const tone =
              trend.kind === "quicker"
                ? "text-[var(--color-success)]"
                : trend.kind === "slower"
                  ? "text-[var(--color-danger)]"
                  : "text-[var(--color-ink-muted)]";
            return <PlayerMark key={trend.player} player={trend.player} label={label} size={16} className={tone} />;
          })}
        </div>
      )}
    </section>
  );
}

function Lane({
  player,
  clock,
  ahead,
  name,
}: {
  player: PlayerSlug;
  clock: string;
  ahead: boolean;
  name: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-sm font-medium">
        <PlayerMark player={player} label={name} />
        <span
          className={`font-mono text-lg font-semibold tabular-nums ${ahead ? "text-[var(--color-accent-muted)]" : "text-[var(--color-ink)]"}`}
          dir="ltr"
        >
          {clock}
        </span>
      </div>
      <div
        data-pace-lane
        className="relative h-11 overflow-hidden rounded-full bg-[var(--color-canvas)] shadow-[inset_0_1px_2px_rgb(38_20_10/0.28)]"
      >
        <span aria-hidden className="absolute inset-y-2 end-2 w-1 rounded-full bg-[var(--color-gold)] shadow-[1px_1px_0_rgb(38_20_10/0.2)]" />
        <span data-pace-checker={player} className="absolute top-0 start-1 flex h-full items-center">
          <span data-pace-piece className="flex">
            <Checker player={player} size={30} aria-hidden />
          </span>
        </span>
      </div>
    </div>
  );
}
