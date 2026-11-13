import type { PlayerTally } from "@/lib/scoring";

export type VersusLabels = {
  niv: string;
  gilad: string;
  vs: string;
  pts: string;
  rows: { wins: string; mars: string; backgammon: string };
  summary: string;
};

/** Niv = dark brown / cream text, Gilad = cream / dark brown text (matches the timer). */
const NIV = "bg-[var(--color-ink)] text-[var(--color-surface)]";
const GILAD = "bg-[var(--color-surface)] text-[var(--color-ink)] ring-1 ring-inset ring-[var(--color-border-strong)]";

/**
 * Two-sided bar: the whole bar is 100%, each side takes its share and shows its
 * number on it. Both zero renders an even, muted split.
 */
function SplitBar({ niv, gilad, tall }: { niv: number; gilad: number; tall?: boolean }) {
  const total = niv + gilad;
  const nivPct = total === 0 ? 50 : (niv / total) * 100;
  const h = tall ? "h-12 text-xl" : "h-8 text-sm";
  const seg = `flex min-w-10 items-center justify-center font-mono font-semibold tabular-nums transition-[flex-basis] duration-700 ${h}`;
  const muted = total === 0 ? "opacity-40" : "";
  return (
    <div className="flex gap-1 overflow-hidden rounded-full" role="img" aria-label={`${niv} : ${gilad}`}>
      <div className={`${seg} ${NIV} ${muted} rounded-s-full`} style={{ flexBasis: `${nivPct}%`, flexGrow: 0, flexShrink: 1 }}>
        {niv}
      </div>
      <div className={`${seg} ${GILAD} ${muted} rounded-e-full`} style={{ flexBasis: `${100 - nivPct}%`, flexGrow: 0, flexShrink: 1 }}>
        {gilad}
      </div>
    </div>
  );
}

export function VersusCard({ niv, gilad, labels }: { niv: PlayerTally; gilad: PlayerTally; labels: VersusLabels }) {
  const rows = [
    { label: labels.rows.wins, n: niv.games, g: gilad.games },
    { label: labels.rows.mars, n: niv.mars, g: gilad.mars },
    { label: labels.rows.backgammon, n: niv.backgammons, g: gilad.backgammons },
  ];
  const nivLeads = niv.points > gilad.points;
  const giladLeads = gilad.points > niv.points;

  return (
    <section
      dir="ltr"
      className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]"
    >
      {/* Head to head header */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-start">
          <p className={`text-lg font-bold ${nivLeads ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]"}`}>{labels.niv}</p>
          <p className="font-mono text-5xl font-bold tabular-nums leading-none text-[var(--color-ink)]">{niv.points}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-black tracking-wider text-[var(--color-ink)] shadow-[var(--shadow-soft)]">
          {labels.vs}
        </div>
        <div className="text-end">
          <p className={`text-lg font-bold ${giladLeads ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]"}`}>{labels.gilad}</p>
          <p className="font-mono text-5xl font-bold tabular-nums leading-none text-[var(--color-ink)]">{gilad.points}</p>
        </div>
      </div>

      <p className="mt-1 text-center text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">{labels.pts}</p>
      <div className="mt-2">
        <SplitBar niv={niv.points} gilad={gilad.points} tall />
      </div>
      <p className="mt-3 text-center text-sm font-medium text-[var(--color-accent-muted)]">{labels.summary}</p>

      <div className="mt-5 space-y-4 border-t border-[var(--color-border)] pt-4">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="mb-1.5 text-center text-xs font-medium text-[var(--color-ink-muted)]">{r.label}</p>
            <SplitBar niv={r.n} gilad={r.g} />
          </div>
        ))}
      </div>
    </section>
  );
}
