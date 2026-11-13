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
        className="absolute inset-0 bg-[var(--color-ink)]/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90svh] overscroll-contain w-full overflow-y-auto rounded-t-[var(--radius-lg)] bg-[var(--color-surface-raised)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-soft)] sm:max-w-md sm:rounded-[var(--radius-lg)]"
      >
        <h2 id={titleId} className="text-lg font-semibold text-[var(--color-ink)]">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
