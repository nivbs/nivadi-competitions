import {
  COOKIE_PLAYER,
  COOKIE_SITE,
  isPlayerSlug,
  SITE_ACCESS_TOKEN,
  type PlayerSlug,
} from "@/lib/session/types";
import { getSessionSecret, verifyPayload } from "@/lib/session/sign";

function resolveSecret(): string {
  return getSessionSecret();
}

export async function requestHasSiteAccess(
  siteCookieValue: string | undefined,
): Promise<boolean> {
  if (!siteCookieValue) {
    return false;
  }
  const payload = await verifyPayload(
    resolveSecret(),
    siteCookieValue,
    SITE_ACCESS_TOKEN,
  );
  return payload === SITE_ACCESS_TOKEN;
}

export async function requestPlayerSlug(
  playerCookieValue: string | undefined,
): Promise<PlayerSlug | null> {
  if (!playerCookieValue) {
    return null;
  }
  const payload = await verifyPayload(resolveSecret(), playerCookieValue);
  if (!payload || !isPlayerSlug(payload)) {
    return null;
  }
  return payload;
}

export function readAuthCookies(request: {
  cookies: { get: (name: string) => { value: string } | undefined };
}): { site: string | undefined; player: string | undefined } {
  return {
    site: request.cookies.get(COOKIE_SITE)?.value,
    player: request.cookies.get(COOKIE_PLAYER)?.value,
  };
}
