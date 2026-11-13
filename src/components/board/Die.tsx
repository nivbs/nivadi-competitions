import type { HTMLAttributes } from "react";

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

const PIPS: Record<DieFace, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

type Props = {
  face: DieFace;
  size?: number;
} & HTMLAttributes<HTMLDivElement>;

/**
 * A 3D white die that shows pips, never numerals.
 * Odd faces (1, 3, 5) have red pips, even faces (2, 4, 6) black.
 */
export function Die({ face, size = 56, className = "", style, ...rest }: Props) {
  const color = face % 2 === 1 ? "var(--color-pip-red)" : "var(--color-pip-black)";
  const pip = size * 0.19;
  const pad = size * 0.14;
  return (
    <div
      role="img"
      aria-label={String(face)}
      {...rest}
      className={`inline-grid shrink-0 grid-cols-3 grid-rows-3 place-items-center ${className}`}
      style={{
        width: size,
        height: size,
        padding: pad,
        borderRadius: size * 0.2,
        background: "linear-gradient(145deg, #ffffff 0%, var(--color-die) 45%, #e6dcc6 100%)",
        boxShadow: `var(--shadow-die), inset ${size * 0.04}px ${size * 0.04}px ${size * 0.06}px #fff, inset -${size * 0.05}px -${size * 0.07}px ${size * 0.1}px rgb(90 60 20 / 0.28), 0 0 0 1px rgb(90 60 20 / 0.35)`,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {Array.from({ length: 9 }, (_, i) =>
        PIPS[face].includes(i) ? (
          <span
            key={i}
            style={{
              width: pip,
              height: pip,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${color} 70%, white) 0%, ${color} 60%)`,
              boxShadow: "inset 0 -1px 1px rgb(0 0 0 / 0.4)",
            }}
          />
        ) : (
          <span key={i} />
        ),
      )}
    </div>
  );
}
