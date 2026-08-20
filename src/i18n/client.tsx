"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Dictionary } from "@/i18n"
import { fill, plural, type Phrase } from "@/i18n/format"
import { defaultLocale, type Locale } from "@/i18n/config"

interface I18nValue {
  locale: Locale
  dict: Dictionary
}

const I18nContext = createContext<I18nValue | null>(null)

/**
 * Carries the dictionary resolved on the server down to Client Components.
 *
 * The dictionary is chosen and merged server-side, so no translation file is
 * fetched in the browser and there is no flash of Azerbaijani before the chosen
 * language arrives — the first byte of HTML is already in the right language.
 */
export function I18nProvider({
  locale,
  dict,
  children,
}: I18nValue & { children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, dict }}>
      {children}
    </I18nContext.Provider>
  )
}

/**
 * `const t = useT()` then `t.nav.signIn`, or `t.f(t.common.serviceCount, {count})`
 * for a string with placeholders.
 *
 * Falls back to the Azerbaijani dictionary if a component is somehow rendered
 * outside the provider, rather than throwing: a missing provider should not
 * take a page down.
 */
export function useT() {
  const value = useContext(I18nContext)
  if (!value) {
    throw new Error("useT must be used inside <I18nProvider>")
  }
  return {
    ...value.dict,
    locale: value.locale,
    /** `t.f(t.catalog.searchIn, { category })` */
    f: fill,
    /** `t.n(t.common.serviceCount, count)` — plural-aware. */
    n: (phrase: Phrase, count: number) => plural(phrase, count, value.locale),
  }
}

export function useLocale(): Locale {
  return useContext(I18nContext)?.locale ?? defaultLocale
}
