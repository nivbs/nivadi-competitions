"use client";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { useI18n } from "@/lib/i18n/client";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useI18n();
  return (
    <BottomSheet open={open} title={title} onClose={onCancel}>
      {description ? (
        <p className="text-sm text-[var(--color-ink-muted)]">{description}</p>
      ) : null}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="h-12 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] font-semibold text-[var(--color-ink)]"
        >
          {t.common.cancel}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className="h-12 rounded-[var(--radius-md)] bg-[var(--color-danger)] font-semibold text-white disabled:opacity-60"
        >
          {pending ? "…" : (confirmLabel ?? t.common.delete)}
        </button>
      </div>
    </BottomSheet>
  );
}
