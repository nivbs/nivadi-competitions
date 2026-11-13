"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useI18n } from "@/lib/i18n/client";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Mobile bottom sheet / centered modal on larger screens. */
export function BottomSheet({ open, title, onClose, children }: Props) {
  const titleId = useId();
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  // Portal to <body> so the sheet escapes clipped/stacked ancestors (e.g. the
  // full-screen timer) and sits above the bottom nav.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t.common.close}
        className="absolute inset-0 bg-[var(--color-walnut-deep)]/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90svh] overscroll-contain w-full overflow-y-auto rounded-t-[var(--radius-lg)] bg-[var(--color-surface)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t-4 border-[var(--color-gold)] shadow-[var(--shadow-die)] sm:max-w-md sm:rounded-[var(--radius-lg)] sm:border-4"
      >
        <h2 id={titleId} className="font-display text-2xl font-bold text-[var(--color-ink)]">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
