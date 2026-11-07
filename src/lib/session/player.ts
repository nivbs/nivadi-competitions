import { getPlayerSlugFromCookies } from "@/lib/session/cookies";
import type { PlayerSlug } from "@/lib/session/types";

export async function getPlayerSlugFromSession(): Promise<PlayerSlug | null> {
  return getPlayerSlugFromCookies();
}

export { PLAYER_DISPLAY } from "@/lib/session/types";
