"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { LOCALE_COOKIE, LOCALE_MAX_AGE_SEC, isLocale } from "@/lib/i18n/config";

export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    sameSite: "lax",
    maxAge: LOCALE_MAX_AGE_SEC,
    path: "/",
  });
  revalidatePath("/", "layout");
}
