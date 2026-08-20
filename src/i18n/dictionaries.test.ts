import { describe, expect, it } from "vitest"
import az from "@/i18n/dictionaries/az.json"
import ru from "@/i18n/dictionaries/ru.json"
import en from "@/i18n/dictionaries/en.json"
import tr from "@/i18n/dictionaries/tr.json"
import { locales } from "@/i18n/config"
import { fill, plural, type Phrase } from "@/i18n/format"
import { mergeWithFallback } from "@/i18n/merge"

type Node = Record<string, unknown>

const dictionaries: Record<string, Node> = { az, ru, en, tr }

/** Every leaf, as `namespace.key` → value. */
function flatten(node: Node, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === "object" && !Array.isArray(value)) {
      // Plural forms are a leaf, not a namespace.
      const inner = value as Node
      const isPlural = Object.keys(inner).every((k) =>
        ["zero", "one", "two", "few", "many", "other"].includes(k)
      )
      if (isPlural) out[path] = inner
      else Object.assign(out, flatten(inner, path))
    } else {
      out[path] = value
    }
  }
  return out
}

const source = flatten(az)
const placeholders = (value: string) =>
  [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe("dictionaries", () => {
  it("ships one for every locale", () => {
    for (const locale of locales) {
      expect(dictionaries[locale], locale).toBeDefined()
    }
  })

  /*
   * Parity is required for UI copy, where Azerbaijani is authored first and
   * every other language is a translation of it.
   *
   * The `data` namespace is deliberately exempt: it holds the hospital's own
   * content — departments, branches, groups — whose Azerbaijani lives in
   * src/data rather than the dictionary, so its maps are empty here and the
   * translations legitimately carry keys Azerbaijani does not.
   */
  const uiKeys = (node: Node) =>
    Object.keys(flatten(node)).filter((key) => !key.startsWith("data."))

  it.each(["ru", "en", "tr"])("%s has every UI key Azerbaijani has", (locale) => {
    const translated = flatten(dictionaries[locale])
    const missing = uiKeys(az as unknown as Node).filter(
      (key) => !(key in translated)
    )
    expect(missing).toEqual([])
  })

  it.each(["ru", "en", "tr"])("%s adds no UI key Azerbaijani lacks", (locale) => {
    const missing = uiKeys(dictionaries[locale]).filter((key) => !(key in source))
    expect(missing).toEqual([])
  })

  /*
   * The failure this guards against is silent and ugly: a translator drops
   * {count} and the page renders "услуг" with no number in front of it.
   */
  it.each(["ru", "en", "tr"])("%s keeps every placeholder", (locale) => {
    const translated = flatten(dictionaries[locale])
    const broken: string[] = []

    for (const [key, value] of Object.entries(source)) {
      const other = translated[key]
      const expected =
        typeof value === "string"
          ? placeholders(value)
          : placeholders(Object.values(value as Node).join(" "))
      const actual =
        typeof other === "string"
          ? placeholders(other)
          : placeholders(Object.values((other ?? {}) as Node).join(" "))

      for (const name of new Set(expected)) {
        if (!actual.includes(name)) broken.push(`${key} is missing {${name}}`)
      }
    }

    expect(broken).toEqual([])
  })

  it.each(["ru", "en", "tr"])("%s leaves nothing blank", (locale) => {
    const translated = flatten(dictionaries[locale])
    const blank = Object.entries(translated)
      .filter(([, value]) => typeof value === "string" && !value.trim())
      .map(([key]) => key)
    expect(blank).toEqual([])
  })

  /* A translation identical to the source usually means it was skipped. */
  /*
   * Strings that are legitimately the same in every language: a printed field
   * format is not prose, and "translating" it would make the hint disagree with
   * what the form actually accepts.
   */
  const IDENTICAL_BY_DESIGN = new Set(["booking.cardNoFormat"])

  it.each(["ru", "en"])("%s is actually translated, not copied", (locale) => {
    const translated = flatten(dictionaries[locale])
    const identical = Object.entries(source).filter(
      ([key, value]) =>
        typeof value === "string" &&
        value.length > 12 &&
        !IDENTICAL_BY_DESIGN.has(key) &&
        translated[key] === value
    )
    expect(identical.map(([key]) => key)).toEqual([])
  })
})

describe("plural", () => {
  it("agrees in Russian, where three forms are needed", () => {
    const phrase = ru.common.serviceCount as Phrase
    expect(plural(phrase, 1, "ru")).toBe("1 услуга")
    expect(plural(phrase, 3, "ru")).toBe("3 услуги")
    expect(plural(phrase, 8, "ru")).toBe("8 услуг")
  })

  it("agrees in English", () => {
    const phrase = en.common.serviceCount as Phrase
    expect(plural(phrase, 1, "en")).toBe("1 service")
    expect(plural(phrase, 2, "en")).toBe("2 services")
  })

  /* Azerbaijani and Turkish take no plural suffix after a numeral. */
  it("leaves a single-form language alone", () => {
    expect(plural(az.common.serviceCount as Phrase, 5, "az")).toBe("5 xidmət")
    expect(plural(tr.common.serviceCount as Phrase, 5, "tr")).toBe("5 hizmet")
  })
})

describe("fill", () => {
  it("substitutes values and leaves unknown placeholders visible", () => {
    expect(fill("qiymətlər {branch} üzrə", { branch: "Gəncə" })).toBe(
      "qiymətlər Gəncə üzrə"
    )
    expect(fill("{a} {b}", { a: "x" })).toBe("x {b}")
  })
})

describe("plural phrases survive the fallback merge", () => {
  const merge = (locale: Node) =>
    mergeWithFallback(az as unknown as Node, locale) as unknown as {
      common: { serviceCount: Phrase; categoryCount: Phrase }
      doctors: { years: Phrase }
    }

  /*
   * The bug this covers shipped: the merge accepted only string overrides, so
   * Russian and English plural objects were discarded and the Azerbaijani kept
   * — "50 kateqoriya" in the middle of a Russian page.
   */
  it.each([
    ["ru", ru],
    ["en", en],
  ] as const)("keeps the %s plural forms", (_name, dict) => {
    const merged = merge(dict as unknown as Node)
    for (const phrase of [
      merged.common.serviceCount,
      merged.common.categoryCount,
      merged.doctors.years,
    ]) {
      expect(typeof phrase).toBe("object")
    }
  })

  it("renders a different Russian form for 1, 3 and 50", () => {
    const merged = merge(ru as unknown as Node)
    const forms = [1, 3, 50].map((n) =>
      plural(merged.common.serviceCount, n, "ru")
    )
    expect(new Set(forms).size).toBe(3)
    for (const form of forms) expect(form).not.toMatch(/xidmət/)
  })

  it("still falls back to Azerbaijani for a key a translation is missing", () => {
    const merged = mergeWithFallback(az as unknown as Node, {
      common: {},
    }) as unknown as { common: { loading: string } }
    expect(merged.common.loading).toBe((az as Node & { common: { loading: string } }).common.loading)
  })

  it("leaves Turkish counts as plain strings", () => {
    const merged = merge(tr as unknown as Node)
    expect(typeof merged.common.serviceCount).toBe("string")
  })
})

describe("data maps survive the merge", () => {
  /*
   * Azerbaijani is the source text in src/data, so its data maps are empty.
   * A merge that walks only the fallback's keys therefore deletes every
   * translated department, branch and group — and nothing errors: the page
   * renders Azerbaijani content inside an English layout.
   */
  it.each([
    ["ru", ru],
    ["en", en],
    ["tr", tr],
  ] as const)("keeps %s departments, branches and groups", (_name, dict) => {
    const merged = mergeWithFallback(az as unknown as Node, dict as unknown as Node) as {
      data: {
        departments: Record<string, unknown>
        branches: Record<string, unknown>
        groups: Record<string, unknown>
        faq: unknown[]
      }
    }

    expect(Object.keys(merged.data.departments).length).toBeGreaterThan(10)
    expect(Object.keys(merged.data.branches)).toEqual([
      "nrimanov",
      "qarayev",
      "ganca",
    ])
    expect(Object.keys(merged.data.groups).length).toBe(3)
    expect(merged.data.faq.length).toBeGreaterThan(0)
  })

  it("replaces an array wholesale rather than splicing two languages", () => {
    const merged = mergeWithFallback(
      { list: ["az one", "az two"] },
      { list: ["en one"] }
    ) as { list: string[] }
    expect(merged.list).toEqual(["en one"])
  })

  it("keeps the fallback array when the translation has none", () => {
    const merged = mergeWithFallback({ list: ["az one"] }, {}) as { list: string[] }
    expect(merged.list).toEqual(["az one"])
  })
})
