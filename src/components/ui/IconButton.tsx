import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tone?: "default" | "danger" | "onDark";
  children: ReactNode;
};

/** 44px touch target, icon only; the label is required for accessibility. */
export function IconButton({
  label,
  tone = "default",
  className = "",
  children,
  ...rest
}: Props) {
  const color =
    tone === "danger"
      ? "text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
      : tone === "onDark"
        ? "text-[var(--color-cream)] hover:bg-white/10"
        : "text-[var(--color-ink-muted)] hover:bg-[var(--color-border)]/50";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${color} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
