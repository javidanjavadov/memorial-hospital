import type { Locale } from "@/i18n/config"

/** A translated string, or its plural forms where a language needs them. */
export type Phrase = string | Partial<Record<Intl.LDMLPluralRule, string>>

/**
 * Fills {placeholders} in a translated string.
 *
 * Deliberately not a template literal in the dictionary: a translator has to be
 * able to move {count} to wherever the number belongs in their language, which
 * is not always where Azerbaijani puts it.
 */
export function fill(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  )
}

/**
 * Picks the right plural form, then fills it.
 *
 * Azerbaijani and Turkish take no plural suffix after a numeral, so their
 * entries stay plain strings. Russian has three forms and English two — without
 * this, Russian read "1 услуг" and English "1 services", which is the kind of
 * thing that makes a site look translated by a machine.
 */
export function plural(
  phrase: Phrase,
  count: number,
  locale: Locale
): string {
  if (typeof phrase === "string") return fill(phrase, { count })

  const rule = new Intl.PluralRules(locale).select(count)
  const template = phrase[rule] ?? phrase.other ?? Object.values(phrase)[0] ?? ""

  return fill(template, { count })
}
