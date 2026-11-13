"use client";

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  "aria-label": string;
  pad?: number;
};

function wrapStep(current: number, delta: number, min: number, max: number) {
  const range = max - min + 1;
  return min + ((((current - min + delta) % range) + range) % range);
}

/** Compact looping value stepper for minutes / seconds (wrap at min/max). */
export function LoopWheel({ min, max, value, onChange, "aria-label": ariaLabel, pad = 2 }: Props) {
  const nudge = (delta: number) => {
    onChange(wrapStep(value, delta, min, max));
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        className="flex h-9 w-12 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] text-[var(--color-ink)] hover:border-[var(--color-brand)]"
        aria-label={`${ariaLabel}, up`}
        onClick={() => nudge(1)}
      >
        ▲
      </button>
      <span
        className="flex h-10 w-12 items-center justify-center font-mono text-lg font-semibold tabular-nums text-[var(--color-ink)]"
        dir="ltr"
        role="spinbutton"
        aria-label={ariaLabel}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            nudge(1);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            nudge(-1);
          }
        }}
      >
        {String(value).padStart(pad, "0")}
      </span>
      <button
        type="button"
        className="flex h-9 w-12 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] text-[var(--color-ink)] hover:border-[var(--color-brand)]"
        aria-label={`${ariaLabel}, down`}
        onClick={() => nudge(-1)}
      >
        ▼
      </button>
    </div>
  );
}
