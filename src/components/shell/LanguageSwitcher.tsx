"use client";

import { useFx } from "@/components/motion/FxProvider";
import type { DieFace } from "@/components/board/Die";
import { useTransition } from "react";

import { setLocale } from "@/actions/locale";
import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";

function IsraelFlag() {
  return (
    <svg viewBox="0 0 22 16" width="22" height="16" aria-hidden="true" className="rounded-[2px]">
      <rect width="22" height="16" fill="#fff" />
      <rect y="1.6" width="22" height="2.4" fill="#0038b8" />
      <rect y="12" width="22" height="2.4" fill="#0038b8" />
      <g fill="none" stroke="#0038b8" strokeWidth="0.9">
        <path d="M11 4.6 L14.2 10.2 H7.8 Z" />
        <path d="M11 11.4 L7.8 5.8 H14.2 Z" />
      </g>
      <rect width="22" height="16" fill="none" stroke="#0003" strokeWidth="0.6" />
    </svg>
  );
}

function UkFlag() {
  return (
    <svg viewBox="0 0 60 30" width="22" height="16" preserveAspectRatio="none" aria-hidden="true" className="rounded-[2px]">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M30 0 V30 M0 15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0 V30 M0 15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

const OPTIONS: { locale: Locale; Flag: () => React.JSX.Element }[] = [
  { locale: "he", Flag: IsraelFlag },
  { locale: "en", Flag: UkFlag },
];

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();
  const fx = useFx();

  return (
    <div role="group" aria-label={t.lang.label} className="flex shrink-0 items-center gap-1" dir="ltr">
      {OPTIONS.map(({ locale: l, Flag }) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={active}
            aria-label={t.lang[l]}
            title={t.lang[l]}
            disabled={pending}
            onClick={() => {
              if (!active) {
                fx({ kind: "reroll", face: ((Math.floor(Math.random() * 6) + 1) as DieFace) });
                startTransition(() => setLocale(l));
              }
            }}
            className={`inline-flex h-8 w-9 items-center justify-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] ${
              active
                ? "border-[var(--color-gold)] bg-[var(--color-cream)]"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <Flag />
          </button>
        );
      })}
    </div>
  );
}
