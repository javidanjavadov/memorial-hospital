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
 * Not text a patient reads.
 *
 * Locale tags and font names are configuration; the data files hold the
 * hospital's own Azerbaijani source, which is translated by id at render.
 */
const ALLOWED = [
  /az-AZ|az_AZ|ru_RU|en_US|tr_TR/,
  /Azərbaycanca|Türkçe/, // the language switcher names each language in itself
]

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

  /* String literals, template literals, and text between JSX tags. */
  const patterns = [
    /"([^"\n]{3,})"/g,
    /'([^'\n]{3,})'/g,
    /`([^`]{3,})`/g,
    />([^<>{}\n]{3,})</g,
  ]

  for (const pattern of patterns) {
    for (const match of code.matchAll(pattern)) {
      const text = match[1].trim()
      if (!text || !AZERBAIJANI.test(text)) continue
      if (ALLOWED.some((allowed) => allowed.test(text))) continue
      found.push(text.slice(0, 70))
    }
  }

  return found
}

describe("no hardcoded Azerbaijani in components", () => {
  const sources = ROOTS.flatMap(files).filter(
    (path) => !path.endsWith(".test.ts")
  )

  it("scans every component and page", () => {
    expect(sources.length).toBeGreaterThan(30)
  })

  it.each(sources)("%s reads its text from the dictionary", (path) => {
    const offenders = offendersIn(readFileSync(path, "utf8"))
    expect(offenders).toEqual([])
  })
})
