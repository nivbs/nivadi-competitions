import type { ReactNode } from "react";

import { PointsRow } from "@/components/board/PointsRow";

/** Walnut frame around a cream felt panel, with points top and bottom. */
export function BoardFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`wood overflow-hidden rounded-[var(--radius-lg)] p-2 shadow-[var(--shadow-die)] ring-1 ring-[var(--color-gold)]/60 ${className}`}
    >
      <PointsRow height={10} />
      <div className="felt stitched my-1.5 rounded-[var(--radius-sm)] p-5 sm:p-6">{children}</div>
      <PointsRow height={10} flip />
    </div>
  );
}
