import { NextResponse, type NextRequest } from "next/server";

import {
  readAuthCookies,
  requestHasSiteAccess,
  requestPlayerSlug,
} from "@/lib/session/verify-request";

const signInPrefix = "/sign-in";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(signInPrefix)) {
    return NextResponse.next();
  }

  const { site, player } = readAuthCookies(request);
  const siteOk = await requestHasSiteAccess(site);
  if (!siteOk) {
    const url = request.nextUrl.clone();
    url.pathname = signInPrefix;
    url.search = "step=gate";
    return NextResponse.redirect(url);
  }

  const playerSlug = await requestPlayerSlug(player);
  if (!playerSlug) {
    const url = request.nextUrl.clone();
    url.pathname = signInPrefix;
    url.search = "step=player";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
