import { describe, expect, it } from "vitest"
import az from "@/i18n/dictionaries/az.json"
import ru from "@/i18n/dictionaries/ru.json"
import en from "@/i18n/dictionaries/en.json"
import tr from "@/i18n/dictionaries/tr.json"
import { locales } from "@/i18n/config"
import { fill, plural, type Phrase } from "@/i18n/format"

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

  it.each(["ru", "en", "tr"])("%s has every key Azerbaijani has", (locale) => {
    const translated = flatten(dictionaries[locale])
    const missing = Object.keys(source).filter((key) => !(key in translated))
    expect(missing).toEqual([])
  })

  it.each(["ru", "en", "tr"])("%s adds no key Azerbaijani lacks", (locale) => {
    const translated = flatten(dictionaries[locale])
    const extra = Object.keys(translated).filter((key) => !(key in source))
    expect(extra).toEqual([])
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
  it.each(["ru", "en"])("%s is actually translated, not copied", (locale) => {
    const translated = flatten(dictionaries[locale])
    const identical = Object.entries(source).filter(
      ([key, value]) =>
        typeof value === "string" &&
        value.length > 12 &&
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
