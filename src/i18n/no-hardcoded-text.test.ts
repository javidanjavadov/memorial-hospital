import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Fails when a component carries Azerbaijani text of its own.
 *
 * Every string a patient reads has to come from the dictionary, or it stays
 * Azerbaijani in all four languages. The site-wide page scan
 * (scripts/check-locales.mjs) catches that at runtime, but only where the text
 * is in the server's HTML — the profile renders as a spinner and fills in on
 * the client, so a hardcoded label there survived every scan and shipped.
 *
 * This reads the source instead, so it does not care whether a string is ever
 * rendered on the server, behind a tab, inside a dialog or after three steps of
 * a form.
 */

const ROOTS = ["src/app", "src/components"]

/** Letters Azerbaijani has. "ə" is unique to it; the rest it shares with Turkish. */
const AZERBAIJANI = /[əƏ]|[ğıışşçöüĞİŞÇÖÜ]/u

/*
 * Azerbaijani words that happen to be spelled with plain ASCII.
 *
 * "Yadda Saxla" on the save button carried no diacritic, so the letter test
 * above read it as Latin and let it through — it stood in Azerbaijani on the
 * Russian profile page until a patient pointed at it. Letters alone are not
 * enough; these words are.
 */
const AZERBAIJANI_ASCII =
  /\b(yadda|saxla|saxlanilir|simvol|soyad|cins|xidmet|hekim|qebul|netice|sifaris|imtina|legv|daxil|cixis|gonder|axtar|redakte|melumat|butun|secin|yukle|bagla|davam|duzelis|nomre|kecid|elave|tesdiq|giris|odenis|filial|sehife|kod|kodu|kart|nagd|tarix|geri|ad)\b/iu

/*
 * Not text a patient reads.
 *
 * Locale tags and font names are configuration; the data files hold the
 * hospital's own Azerbaijani source, which is translated by id at render.
 */
const ALLOWED = [
  /az-AZ|az_AZ|ru_RU|en_US|tr_TR/,
  /Azərbaycanca|Türkçe/, // the language switcher names each language in itself
]

/*
 * The root-layout error boundary replaces the provider that carries the
 * dictionary, so it is the one file that has to hold its own text — in all
 * four languages, chosen from the locale cookie.
 */
const EXEMPT = ["global-error.tsx"]

const files = (dir: string): string[] => {
  const entries = readdirSync(dir)
  return entries.flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return files(path)
    return path.endsWith(".tsx") || path.endsWith(".ts") ? [path] : []
  })
}

/** Strips comments: an explanation may name the Azerbaijani it replaced. */
const withoutComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "")

const offendersIn = (source: string) => {
  const code = withoutComments(source)
  const found: string[] = []

  /*
   * Attribute values are matched on their own, anchored to the attribute name.
   * Scanning for bare quote pairs walks the file two quotes at a time, so one
   * unpaired quote anywhere above shifts every pair after it and a label like
   * label="Ad Soyad" falls between them — which is exactly how three hardcoded
   * labels on the booking form passed a green run.
   */
  const patterns = [
    /\w+="([^"\n]{2,})"/g,
    /"([^"\n]{3,})"/g,
    /'([^'\n]{3,})'/g,
    /`([^`]{3,})`/g,
    />([^<>{}]{3,})</g,
  ]

  for (const pattern of patterns) {
    for (const match of code.matchAll(pattern)) {
      const text = match[1].trim()
      if (!text) continue
      if (!AZERBAIJANI.test(text) && !AZERBAIJANI_ASCII.test(text)) continue
      /*
       * Route slugs are Azerbaijani too — "/qebul", "xidmetler", "#hekimler" —
       * and they are addresses, not text anyone reads. A single token with no
       * space in it is one of those, unless it carries a letter only prose has.
       */
      if (!/\s/.test(text) && !AZERBAIJANI.test(text)) continue
      if (ALLOWED.some((allowed) => allowed.test(text))) continue
      found.push(text.slice(0, 70))
    }
  }

  return found
}

describe("no hardcoded Azerbaijani in components", () => {
  const sources = ROOTS.flatMap(files).filter(
    (path) =>
      !path.endsWith(".test.ts") &&
      !EXEMPT.some((name) => path.endsWith(name))
  )

  it("scans every component and page", () => {
    expect(sources.length).toBeGreaterThan(30)
  })

  it.each(sources)("%s reads its text from the dictionary", (path) => {
    const offenders = offendersIn(readFileSync(path, "utf8"))
    expect(offenders).toEqual([])
  })
})
