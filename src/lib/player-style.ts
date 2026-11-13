import type { PlayerSlug } from "@/lib/session/types";

/**
 * Player-color law: Niv is always the dark side, Gilad is always the light side.
 * Every player-owned surface takes its colors from here; never hardcode them elsewhere.
 */
export const PLAYER_VARS: Record<PlayerSlug, { fill: string; edge: string; ink: string }> = {
  niv: {
    fill: "var(--player-niv-fill)",
    edge: "var(--player-niv-edge)",
    ink: "var(--player-niv-ink)",
  },
  gilad: {
    fill: "var(--player-gilad-fill)",
    edge: "var(--player-gilad-edge)",
    ink: "var(--player-gilad-ink)",
  },
};

/** Solid fill + readable text + hairline rim, as Tailwind classes. */
export function playerTone(slug: PlayerSlug): string {
  return slug === "niv"
    ? "bg-[var(--player-niv-fill)] text-[var(--player-niv-ink)] ring-1 ring-inset ring-[var(--player-niv-edge)]"
    : "bg-[var(--player-gilad-fill)] text-[var(--player-gilad-ink)] ring-1 ring-inset ring-[var(--player-gilad-edge)]";
}

/** Full-bleed player surface (timer halves): solid fill + readable text, no ring. */
export function playerFill(slug: PlayerSlug): string {
  return slug === "niv"
    ? "bg-[var(--player-niv-fill)] text-[var(--player-niv-ink)]"
    : "bg-[var(--player-gilad-fill)] text-[var(--player-gilad-ink)]";
}
