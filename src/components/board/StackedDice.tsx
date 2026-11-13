import type { HTMLAttributes } from "react";

import { Die, type DieFace } from "@/components/board/Die";

type Props = {
  /** Visual height of the stack (header slot). */
  size?: number;
  top?: DieFace;
  bottom?: DieFace;
} & HTMLAttributes<HTMLDivElement>;

/** Two pipped dice stacked — logo mark for שש־בש (5 and 6). */
export function StackedDice({
  size = 38,
  top = 5,
  bottom = 6,
  className = "",
  style,
  ...rest
}: Props) {
  const dieSize = Math.round(size * 0.62);
  const width = dieSize + 2;

  return (
    <div
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width, height: size, ...style }}
      {...rest}
    >
      <Die
        face={bottom}
        size={dieSize}
        className="absolute left-1/2"
        style={{ bottom: 0, zIndex: 0, transform: "translateX(-50%)" }}
      />
      <Die
        face={top}
        size={dieSize}
        className="absolute left-1/2"
        style={{ top: 0, zIndex: 1, transform: "translateX(-50%) rotate(-7deg)" }}
      />
    </div>
  );
}
