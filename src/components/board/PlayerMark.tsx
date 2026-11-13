import { Checker } from "@/components/board/Checker";
import type { PlayerSlug } from "@/lib/session/types";

/** A player's name always travels with their checker. */
export function PlayerMark({
  player,
  label,
  size = 18,
  className = "",
}: {
  player: PlayerSlug;
  label: string;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Checker player={player} size={size} aria-hidden />
      <span>{label}</span>
    </span>
  );
}
