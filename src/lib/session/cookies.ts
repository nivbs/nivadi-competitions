import { cookies } from "next/headers";

import {
  COOKIE_MAX_AGE_SEC,
  COOKIE_PLAYER,
  COOKIE_SITE,
  isPlayerSlug,
  SITE_ACCESS_TOKEN,
  type PlayerSlug,
} from "@/lib/session/types";
import { getSessionSecret, signPayload, verifyPayload } from "@/lib/session/sign";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE_SEC,
    path: "/",
  };
}

export async function setSiteAccessCookie(): Promise<void> {
  const token = await signPayload(getSessionSecret(), SITE_ACCESS_TOKEN);
  const store = await cookies();
  store.set(COOKIE_SITE, token, cookieOptions());
}

export async function setPlayerCookie(slug: PlayerSlug): Promise<void> {
  const token = await signPayload(getSessionSecret(), slug);
  const store = await cookies();
  store.set(COOKIE_PLAYER, token, cookieOptions());
}

export async function clearPlayerCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_PLAYER);
}

export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_SITE);
  store.delete(COOKIE_PLAYER);
}

export async function hasSiteAccessFromCookies(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE_SITE)?.value;
  if (!raw) {
    return false;
  }
  const payload = await verifyPayload(getSessionSecret(), raw, SITE_ACCESS_TOKEN);
  return payload === SITE_ACCESS_TOKEN;
}

export async function getPlayerSlugFromCookies(): Promise<PlayerSlug | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_PLAYER)?.value;
  if (!raw) {
    return null;
  }
  const payload = await verifyPayload(getSessionSecret(), raw);
  if (!payload || !isPlayerSlug(payload)) {
    return null;
  }
  return payload;
}
