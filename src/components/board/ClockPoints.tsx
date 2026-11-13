import { useId } from "react";

import type { PlayerSlug } from "@/lib/session/types";

/**
 * Long backgammon points rising from the bottom edge of a clock half (the Gilad half is
 * rotated 180deg, so there they hang from the top, like the opposite side of the board).
 * Semi-transparent so the clock text stays readable; tints follow the owner's color.
 */
export function ClockPoints({ player }: { player: PlayerSlug }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const dark = player === "niv";
  // Alternating tan / deep tones, tuned per background.
  const a = dark ? "rgb(176 124 76 / 0.38)" : "rgb(74 38 22 / 0.30)";
  const b = dark ? "rgb(246 232 204 / 0.13)" : "rgb(176 124 76 / 0.34)";
  const seam = dark ? "rgb(246 232 204 / 0.45)" : "rgb(246 232 204 / 0.8)";
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[78%] w-full"
      viewBox="0 0 12 10"
      preserveAspectRatio="none"
    >
      <defs>
        <clipPath id={id}>
          <rect width="12" height="10" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <polygon points={`${i * 2},10 ${i * 2 + 2},10 ${i * 2 + 1},0.3`} fill={i % 2 === 0 ? a : b} />
            <line
              x1={i * 2 + 1}
              y1="10"
              x2={i * 2 + 1}
              y2="0.9"
              stroke={seam}
              strokeWidth="1.4"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
