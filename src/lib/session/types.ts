export type PlayerSlug = "niv" | "gilad";

export const COOKIE_SITE = "nivadi_site";
export const COOKIE_PLAYER = "nivadi_player";
export const COOKIE_MAX_AGE_SEC = 90 * 24 * 60 * 60;

export const SITE_ACCESS_TOKEN = "granted";

export const PLAYER_SLUGS: readonly PlayerSlug[] = ["niv", "gilad"];

export function isPlayerSlug(value: string): value is PlayerSlug {
  return value === "niv" || value === "gilad";
}

export const PLAYER_DISPLAY: Record<PlayerSlug, string> = {
  niv: "ניב",
  gilad: "גלעד",
};
