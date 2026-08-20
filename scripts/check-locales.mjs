/**
 * Fails if any page renders text in a language other than the one selected.
 *
 * Run against a dev or production server:
 *
 *     node scripts/check-locales.mjs [http://localhost:3000]
 *
 * How it decides. Each language has letters the others do not:
 *
 *   ə  Azerbaijani only          — never valid in ru/en/tr
 *   А-я Cyrillic                 — never valid in az/en/tr
 *   ğ ı ş ç ö ü  shared by az+tr — only flagged for ru/en
 *
 * That gives a cheap, exact test for "is this the wrong language" without
 * needing a dictionary of every word. Proper nouns are the one legitimate
 * exception, so they are listed explicitly rather than skipped by a rule —
 * a name is data, not a translation.
 */
import { readFile } from "node:fs/promises"
import { load } from "cheerio"

const BASE = process.argv[2] ?? "http://localhost:3000"

/*
 * Names and codes are data, not translations.
 *
 * Doctor names come from the roster and laboratory codes from the catalogue, so
 * they are read from the source rather than hand-listed — a new doctor must not
 * quietly become a translation failure.
 */
const roster = await readFile(new URL("../src/data/index.ts", import.meta.url), "utf8")
/*
 * Doctors only. Matching `id` followed by `name` also caught departments,
 * whose ids are not routes — the scan then reported 404s as translation
 * failures, which is a different problem wearing the same badge.
 */
const DOCTOR_PAGES = [
  ...roster.matchAll(/id: "([a-z0-9-]+)",\s+name: "[^"]+",\s+specialty:/g),
].map((m) => `/hekimler/${m[1]}`)
const NAMES = [...roster.matchAll(/name: "([^"]+)"/g)].map((m) => m[1])
const NAME_WORDS = new Set(NAMES.flatMap((name) => name.split(/[\s,.-]+/)).filter(Boolean))

/** A laboratory code: upper case, digits or slashes, no lower-case letters. */
const isCode = (word) => /^[A-ZÇĞİÖŞÜ0-9/+().,-]+$/u.test(word)

/*
 * Tokens the Azerbaijani source itself contains.
 *
 * A capitalised token that survives into the translation unchanged — Schüller,
 * Dermatophagoides, İP4/5 — was kept on purpose: it is an eponym, a Latin
 * binomial or a printed code, and translating it would make the report
 * disagree with the laboratory's own paperwork. An ordinary word carrying "ə"
 * is never allowed through, whatever the source says.
 */
const catalogue = JSON.parse(
  await readFile(new URL("../src/data/catalog.json", import.meta.url), "utf8")
)
/* Split on the same separators the page check uses, hyphens included: the
   source writes "Anti-Müllerian", the page shows "Müllerian", and the eponym
   is the same word either way. */
const SOURCE_TOKENS = new Set(
  catalogue.items
    .flatMap((item) =>
      `${item.name} ${item.description}`.split(/[\s,;:.!?()[\]«»"'—–/-]+/u)
    )
    .filter(Boolean)
)

/**
 * Medical eponyms: people's surnames that are part of the test's name in every
 * language, diacritics and all. Checked word by word rather than added to
 * PROPER_NOUNS, which would excuse a whole paragraph for containing one.
 */
const EPONYMS = new Set([
  "Müller",
  "Müllerian",
  "Mülleri",
  "Sjögren",
  "Schüller",
  "Löwenstein",
  "Bence",
  "Jones",
])

const isKeptOnPurpose = (word) =>
  EPONYMS.has(word) ||
  SOURCE_TOKENS.has(word) && /^[A-ZÇĞİÖŞÜ]/u.test(word) && !/[əƏ]/u.test(word)

/*
 * Every static route, plus every catalogue category and every doctor — 1168
 * tests and 33 doctors is where a missed translation actually hides, and
 * spot-checking two of them proves nothing.
 */
const catalogueIndex = JSON.parse(
  await readFile(new URL("../public/catalog/az/index.json", import.meta.url), "utf8")
)

const CATEGORY_PAGES = catalogueIndex
  .flatMap((group) => group.categories)
  .filter((category) => !category.featured)
  .map((category) => `/xidmetler/${category.slug}`)

const PAGES = [
  "/",
  "/xidmetler",
  "/hekimler",
  "/filiallar",
  "/haqqimizda",
  "/elaqe",
  "/qebul",
  "/neticeler",
  "/siyaset",
  "/sertler",
  "/giris",
  "/qeydiyyat",
  ...CATEGORY_PAGES,
  ...DOCTOR_PAGES,
]

const LOCALES = ["az", "ru", "en", "tr"]

/**
 * Proper nouns: people, places, institutions and awarding bodies. These keep
 * their spelling in every language, so they are not a translation failure.
 */
const PROPER_NOUNS = [
  "Memorial", "Hospital", "Nərimanov", "Qarayev", "Gəncə", "Bakı", "Zaur",
  "Nudirəliyev", "Nudiraliyev", "Xətai", "ASAN", "Google", "IAS", "RIQAS",
  "QCMD", "Randox", "International", "Accreditation", "Service", "Quality",
  "Control", "Molecular", "Diagnostics", "Assessment", "Scheme", "WhatsApp",
  "Facebook", "Instagram", "STRIX", "AZN", "PCR", "USM", "EKQ", "EXO", "KT",
]


const FOREIGN = {
  az: [/[А-Яа-яЁё]/u],
  ru: [/[əƏ]/u, /[ğışçöüĞİŞÇÖÜ]/u],
  en: [/[əƏ]/u, /[А-Яа-яЁё]/u, /[ğışçöüĞİŞÇÖÜ]/u],
  tr: [/[əƏ]/u, /[А-Яа-яЁё]/u],
}

/**
 * Text nodes and the attributes a person actually receives.
 *
 * aria-label, title, placeholder and alt are read aloud by a screen reader or
 * shown on hover, so a missed translation there is a missed translation — it
 * is simply one only some people meet.
 */
const SPOKEN_ATTRIBUTES = ["aria-label", "title", "placeholder", "alt"]

function visibleText(html) {
  const $ = load(html)
  $("script, style, noscript").remove()
  const out = []

  $("body")
    .find("*")
    .addBack()
    .each((_, element) => {
      for (const attribute of SPOKEN_ATTRIBUTES) {
        const value = $(element).attr(attribute)
        if (value && value.trim()) out.push(value.trim())
      }
    })

  $("body")
    .find("*")
    .addBack()
    .contents()
    .each((_, node) => {
      if (node.type === "text") {
        const value = node.data.trim()
        if (value) out.push(value)
      }
    })

  return out
}

/**
 * The catalogue files the picker fetches after the page has loaded.
 *
 * They never appear in the server HTML, so a page scan alone would pass while
 * every card on /xidmetler rendered in the wrong language.
 */
async function checkCatalogueFiles(locale) {
  const failures = []
  const index = JSON.parse(
    await readFile(
      new URL(`../public/catalog/${locale}/index.json`, import.meta.url),
      "utf8"
    )
  )

  const strings = []
  for (const group of index) {
    strings.push(group.name, group.blurb)
    for (const category of group.categories) strings.push(category.name)
  }

  for (const group of index) {
    for (const category of group.categories) {
      const items = JSON.parse(
        await readFile(
          new URL(
            `../public/catalog/${locale}/${category.slug}.json`,
            import.meta.url
          ),
          "utf8"
        )
      )
      for (const item of items) {
        strings.push(item.name, item.description, item.prep, item.categoryName)
      }
    }
  }

  for (const text of strings) {
    if (!text) continue
    const foreign = foreignWordsIn(text, locale)
    if (foreign.length > 0) {
      failures.push({
        path: `catalog/${locale}`,
        text: `${foreign.join(" ")}   ‹ ${text.slice(0, 60)}`,
      })
    }
  }

  return failures
}

/**
 * Checked word by word, not string by string.
 *
 * A translated sentence legitimately carries untranslated tokens inside it — a
 * doctor's name, a Latin binomial, a printed test code — and judging the whole
 * string would either flag every one of those or excuse a sentence that has one
 * of them in it.
 */
const foreignWordsIn = (text, locale) => {
  if (PROPER_NOUNS.some((noun) => text.includes(noun))) return []
  return text
    // Hyphen included: an allergen list writes "İ6-Таракан", a code joined to a
    // translated word, and the code half is not a translation failure.
    .split(/[\s,;:.!?()[\]«»"'—–/-]+/u)
    .filter(Boolean)
    .filter((word) => FOREIGN[locale].some((pattern) => pattern.test(word)))
    .filter(
      (word) =>
        !NAME_WORDS.has(word) && !isCode(word) && !isKeptOnPurpose(word)
    )
}

async function checkLocale(locale) {
  const failures = []

  for (const path of PAGES) {
    const response = await fetch(`${BASE}${path}`, {
      headers: { cookie: `memorial-locale=${locale}` },
    })
    if (!response.ok) {
      failures.push({ path, text: `HTTP ${response.status}` })
      continue
    }

    for (const text of visibleText(await response.text())) {
      const foreign = foreignWordsIn(text, locale)
      if (foreign.length > 0) {
        failures.push({ path, text: `${foreign.join(" ")}   ‹ ${text.slice(0, 60)}` })
      }
    }
  }

  return failures
}

let total = 0
for (const locale of LOCALES) {
  const failures = [
    ...(await checkLocale(locale)),
    ...(await checkCatalogueFiles(locale)),
  ]
  total += failures.length
  console.log(
    `${locale}: ${failures.length === 0 ? "clean" : `${failures.length} foreign strings`}`
  )
  for (const { path, text } of failures.slice(0, 12)) {
    console.log(`   ${path}  →  ${text}`)
  }
}

if (total > 0) {
  console.error(`\n${total} strings render in the wrong language.`)
  process.exit(1)
}
console.log("\nEvery page renders in the selected language.")
