import type { HTMLAttributes } from "react";

import { PLAYER_VARS } from "@/lib/player-style";
import type { PlayerSlug } from "@/lib/session/types";

type Props = {
  player: PlayerSlug;
  size?: number;
  children?: React.ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">;

/**
 * A backgammon checker. Niv = dark brown with gold rim, Gilad = ivory with walnut rim,
 * so each stays visible on both walnut and felt.
 */
export function Checker({ player, size = 24, children, className = "", style, ...rest }: Props) {
  const c = PLAYER_VARS[player];
  const dark = player === "niv";
  return (
    <span
      {...rest}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        color: c.ink,
        background: dark
          ? `radial-gradient(circle at 35% 30%, #6a4128 0%, ${c.fill} 55%, #20100a 100%)`
          : `radial-gradient(circle at 35% 30%, #ffffff 0%, ${c.fill} 55%, #cdbf9f 100%)`,
        boxShadow: `0 0 0 1.5px ${c.edge}, var(--shadow-checker), inset 0 0 0 ${Math.max(2, size * 0.14)}px ${
          dark ? "rgb(0 0 0 / 0.18)" : "rgb(120 90 40 / 0.14)"
        }`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
