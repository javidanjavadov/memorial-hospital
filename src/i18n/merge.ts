/**
 * Merges a translation over the Azerbaijani source.
 *
 * Kept out of ./index.ts, which is "server-only" and therefore cannot be
 * imported by a unit test — and this is the piece most worth testing, because
 * when it goes wrong it does so silently: the page still renders, just in the
 * wrong language.
 */
/** A `{ one, few, many, other }` object with at least one usable form. */
function isPluralPhrase(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  return Object.values(value as Record<string, unknown>).some(
    (form) => typeof form === "string" && form.trim().length > 0
  )
}

export function mergeWithFallback(
  fallback: Record<string, unknown>,
  translated: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(fallback)) {
    const other = translated?.[key]

    // A nested namespace: recurse, so a missing key inside it still falls back.
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = mergeWithFallback(
        value as Record<string, unknown>,
        (other as Record<string, unknown>) ?? {}
      )
      continue
    }

    /*
     * A plural phrase replacing a plain string.
     *
     * Azerbaijani and Turkish take no plural suffix after a numeral, so their
     * counts are plain strings; Russian needs three forms and English two, and
     * those arrive as objects. Accepting only strings here — as this did —
     * silently kept the Azerbaijani for every counted phrase in Russian and
     * English, which is how "50 kateqoriya" ended up in the middle of a
     * Russian page.
     */
    if (isPluralPhrase(other)) {
      out[key] = other
      continue
    }

    out[key] = typeof other === "string" && other.trim() ? other : value
  }

  return out
}
