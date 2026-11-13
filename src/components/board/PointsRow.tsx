import { useId } from "react";

/** A strip of alternating dark and tan triangular points. */
export function PointsRow({
  height = 10,
  flip = false,
  className = "",
}: {
  height?: number;
  flip?: boolean;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const w = height * 2;
  return (
    <svg
      aria-hidden
      className={`block w-full ${className}`}
      height={height}
      preserveAspectRatio="none"
      style={{ transform: flip ? "scaleY(-1)" : undefined }}
    >
      <defs>
        <pattern id={id} width={w * 2} height={height} patternUnits="userSpaceOnUse">
          <polygon points={`0,0 ${w},0 ${w / 2},${height}`} fill="var(--color-point-dark)" />
          <polygon points={`${w},0 ${w * 2},0 ${w * 1.5},${height}`} fill="var(--color-point-tan)" />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#${id})`} />
    </svg>
  );
}
