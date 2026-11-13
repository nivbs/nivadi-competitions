import { cookies } from "next/headers";
import { enUS, he as heLocale } from "date-fns/locale";
import type { Locale as DateFnsLocale } from "date-fns";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/config";
import { dictionaries, type Dict } from "@/lib/i18n/dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDict(): Promise<{ locale: Locale; t: Dict }> {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

export function dateFnsLocale(locale: Locale): DateFnsLocale {
  return locale === "he" ? heLocale : enUS;
}
