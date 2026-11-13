"use client";

import { useI18n } from "@/lib/i18n/client";
import { WIN_POINTS, WIN_TYPES, type WinType } from "@/lib/scoring";

type Option<T extends string> = { value: T; label: string; hint?: string };

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  name,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  name: string;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid auto-cols-fr grid-flow-col gap-1 rounded-[var(--radius-md)] bg-[var(--color-canvas)] p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`min-h-11 rounded-[var(--radius-sm)] px-2 py-1 text-sm font-semibold transition ${
              active
                ? "bg-[var(--color-brand)] text-white shadow-[var(--shadow-soft)]"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-border)]/50"
            }`}
          >
            {o.label}
            {o.hint ? (
              <span className={`block text-xs font-normal ${active ? "text-white/80" : "text-[var(--color-ink-faint)]"}`}>
                {o.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function WinTypeSelect({
  value,
  onChange,
}: {
  value: WinType;
  onChange: (v: WinType) => void;
}) {
  const { t } = useI18n();
  return (
    <Segmented
      name={t.segmented.winType}
      value={value}
      onChange={onChange}
      options={WIN_TYPES.map((w) => ({
        value: w,
        label: t.winTypes[w],
        hint: `${WIN_POINTS[w]} ${t.common.pts}`,
      }))}
    />
  );
}

export function WinnerSelect({
  value,
  onChange,
}: {
  value: "niv" | "gilad";
  onChange: (v: "niv" | "gilad") => void;
}) {
  const { t } = useI18n();
  return (
    <Segmented
      name={t.segmented.winner}
      value={value}
      onChange={onChange}
      options={[
        { value: "niv", label: t.players.niv },
        { value: "gilad", label: t.players.gilad },
      ]}
    />
  );
}
