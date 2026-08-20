/**
 * The four languages the hospital serves.
 *
 * Azerbaijani is the source: every string is authored in `az.json` and the
 * others are translations of it, so `az` is also the fallback — a key missing
 * from a translation shows the Azerbaijani rather than the raw key, which is
 * ugly but readable, and never blank.
 */
export const locales = ["az", "ru", "en", "tr"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "az"

/** Shown in the switcher, each in its own language. */
export const localeNames: Record<Locale, string> = {
  az: "Azərbaycanca",
  ru: "Русский",
  en: "English",
  tr: "Türkçe",
}

/** Short label for the compact switcher in the header. */
export const localeShortNames: Record<Locale, string> = {
  az: "AZ",
  ru: "RU",
  en: "EN",
  tr: "TR",
}

/** The `lang` attribute, which decides hyphenation and screen-reader voice. */
export const htmlLang: Record<Locale, string> = {
  az: "az",
  ru: "ru",
  en: "en",
  tr: "tr",
}

export const LOCALE_COOKIE = "memorial-locale"

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (locales as readonly string[]).includes(value)
