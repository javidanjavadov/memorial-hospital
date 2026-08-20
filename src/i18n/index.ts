import "server-only"
import { cookies } from "next/headers"
import az from "./dictionaries/az.json"
import type { Phrase } from "./format"
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config"
import { mergeWithFallback } from "./merge"

type Source = typeof az

/**
 * The dictionary shape.
 *
 * Three keys carry a count and therefore may be plural forms rather than a
 * plain string — Russian needs three of them, English two. Azerbaijani and
 * Turkish take no plural suffix after a numeral, so they stay strings, and the
 * type allows either.
 */
export type Dictionary = Omit<Source, "common" | "doctors"> & {
  common: Omit<Source["common"], "serviceCount" | "categoryCount"> & {
    serviceCount: Phrase
    categoryCount: Phrase
  }
  doctors: Omit<Source["doctors"], "years"> & { years: Phrase }
}

/**
 * Dictionaries are imported lazily so a Russian visitor does not pay for the
 * Turkish strings. Azerbaijani is loaded eagerly: it is the fallback, and every
 * render needs it.
 */
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  az: async () => az as Dictionary,
  ru: () =>
    import("./dictionaries/ru.json").then((m) => m.default as unknown as Dictionary),
  en: () =>
    import("./dictionaries/en.json").then((m) => m.default as unknown as Dictionary),
  tr: () =>
    import("./dictionaries/tr.json").then((m) => m.default as unknown as Dictionary),
}

/** The locale chosen by the visitor, from the cookie the switcher sets. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const value = store.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : defaultLocale
}

/**
 * Merged with Azerbaijani, so a key a translation has not caught up with shows
 * the Azerbaijani text rather than a raw key or a blank space. A half-shipped
 * translation should read oddly, never break the page.
 */
export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  const target = locale ?? (await getLocale())
  if (target === "az") return az as Dictionary

  try {
    const translated = await loaders[target]()
    return mergeWithFallback(az, translated) as Dictionary
  } catch {
    return az
  }
}
