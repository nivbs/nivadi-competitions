export const LOCALES = ["he", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "he";
export const LOCALE_COOKIE = "nivadi_locale";
export const LOCALE_MAX_AGE_SEC = 365 * 24 * 60 * 60;

export function isLocale(value: unknown): value is Locale {
  return value === "he" || value === "en";
}

export function dirFor(locale: Locale): "rtl" | "ltr" {
  return locale === "he" ? "rtl" : "ltr";
}
