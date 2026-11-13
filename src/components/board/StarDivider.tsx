/** Eight-point star between two gold rules: replaces plain horizontal rules. */
export function StarDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-[var(--color-border-strong)]/60" />
      <svg width="18" height="18" viewBox="0 0 20 20" className="text-[var(--color-accent-muted)]">
        <rect x="4" y="4" width="12" height="12" fill="currentColor" />
        <rect x="4" y="4" width="12" height="12" fill="currentColor" transform="rotate(45 10 10)" />
        <circle cx="10" cy="10" r="2.2" fill="var(--color-surface)" />
      </svg>
      <span className="h-px flex-1 bg-[var(--color-border-strong)]/60" />
    </div>
  );
}
