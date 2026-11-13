"use client";

import type { ReactNode } from "react";

import { Checker } from "@/components/board/Checker";
import { Die } from "@/components/board/Die";
import { useI18n } from "@/lib/i18n/client";
import { playerTone } from "@/lib/player-style";
import { WIN_POINTS, WIN_TYPES, type WinType } from "@/lib/scoring";

type Option<T extends string> = {
  value: T;
  label: string;
  hint?: string;
  icon?: ReactNode;
  /** Overrides the selected style (used for player-owned options). */
  activeClass?: string;
};

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
    <div role="radiogroup" aria-label={name} className="grid auto-cols-fr grid-flow-col gap-1 rounded-[var(--radius-md)] bg-[var(--color-border)]/50 p-1 shadow-[inset_0_1px_3px_rgb(38_20_10/0.2)]">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 ${o.hint ? "flex-col" : ""} text-sm font-semibold transition ${
              active
                ? `${o.activeClass ?? "bg-[var(--color-brand)] text-white"} shadow-[var(--shadow-soft)]`
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)]/70"
            }`}
          >
            {o.icon}
            <span className="text-center">
              {o.label}
              {o.hint ? (
                <span className={`block text-xs font-normal ${active ? "opacity-80" : "text-[var(--color-ink-faint)]"}`}>
                  {o.hint}
                </span>
              ) : null}
            </span>
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
        icon: <Die face={WIN_POINTS[w] as 1 | 2 | 3} size={26} />,
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
        { value: "niv", label: t.players.niv, icon: <Checker player="niv" size={22} aria-hidden />, activeClass: playerTone("niv") },
        { value: "gilad", label: t.players.gilad, icon: <Checker player="gilad" size={22} aria-hidden />, activeClass: playerTone("gilad") },
      ]}
    />
  );
}
