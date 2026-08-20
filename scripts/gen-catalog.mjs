/**
 * Splits the catalogue into one JSON file per category under public/catalog/.
 *
 * The picker on /xidmetler needs the tests themselves, not just category names,
 * but the full catalogue is 536KB — shipping it to the browser to render one
 * category would be absurd. So each category becomes its own fetchable file and
 * the page pulls exactly the one being looked at, while the index (names, counts
 * and entry prices only) is small enough to render with the page.
 *
 * Generated at build time from src/data/catalog.json, which stays the one
 * source of truth: nothing here is hand-maintained.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = join(root, "public", "catalog")

const DEFAULT_BRANCH = "nrimanov"
const priceOf = (item) =>
  item.prices?.[DEFAULT_BRANCH]?.price ?? Object.values(item.prices ?? {})[0]?.price ?? 0

const GROUPS = [
  {
    slug: "laboratory-catalog",
    name: "Laboratoriya",
    blurb: "Qan, sidik, hormonal, genetik və mikrobioloji analizlər",
  },
  {
    slug: "polyclinic-catalog",
    name: "Poliklinika",
    blurb: "USM, rentgen, tomoqrafiya, EKQ və digər instrumental müayinələr",
  },
  {
    slug: "doctor-appointment",
    name: "Həkim qəbulu",
    blurb: "İxtisas üzrə həkim konsultasiyaları",
  },
]

const data = JSON.parse(await readFile(join(root, "src", "data", "catalog.json"), "utf8"))

const popular = JSON.parse(
  await readFile(join(root, "src", "data", "popular.json"), "utf8")
).groups

/**
 * Catalogue translations, produced once and committed: test names, their
 * descriptions, category names and turnaround times in ru/en/tr.
 *
 * A catalogue of 1168 tests cannot be translated at render time, and it does
 * not change between builds, so each locale gets its own set of files and the
 * picker fetches the one it needs. A missing translation falls back to the
 * Azerbaijani, which is the name the laboratory actually prints.
 */
const i18n = JSON.parse(
  await readFile(join(root, "src", "data", "catalog-i18n.json"), "utf8")
)

const LOCALES = ["az", "ru", "en", "tr"]

const translate = (table, value, locale) =>
  locale === "az" ? value : (table?.[value]?.[locale] ?? value)

const byCategory = new Map()
for (const item of data.items) {
  const list = byCategory.get(item.category)
  if (list) list.push(item)
  else byCategory.set(item.category, [item])
}

// Cleared first, so a category removed upstream cannot linger as a stale file
// the picker would still happily fetch.
await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

/** Only the fields a card and its dialog render — the rest never leaves here. */
const trim = (item, locale) => ({
  slug: item.slug,
  name: translate(i18n.names, item.name, locale),
  code: item.code,
  description: translate(i18n.descriptions, item.description, locale),
  prep: translate(i18n.preps, item.prep, locale),
  categoryName: translate(i18n.categories, item.categoryName, locale),
  prices: item.prices,
})

/* The Azerbaijani index, kept for the closing summary line. */
let summary = []

for (const locale of LOCALES) {
const index = []
await mkdir(join(OUT, locale), { recursive: true })

for (const group of GROUPS) {
  const source = data.groups.find((g) => g.slug === group.slug)
  if (!source) continue

  const categories = []
  // The hospital's catalogue lists "Allergik analizlər" twice under the same
  // slug. Two entries with one slug are one category, and duplicated keys break
  // React's reconciliation downstream — a chip from the previous group survived
  // a group switch.
  const seen = new Set()

  for (const category of source.categories) {
    if (seen.has(category.slug)) continue
    seen.add(category.slug)
    const items = (byCategory.get(category.slug) ?? [])
      .slice()
      .sort((a, b) => priceOf(a) - priceOf(b))
    if (items.length === 0) continue

    await writeFile(
      join(OUT, locale, `${category.slug}.json`),
      JSON.stringify(items.map((item) => trim(item, locale)))
    )

    categories.push({
      slug: category.slug,
      name: translate(i18n.categories, category.name, locale),
      count: items.length,
      from: priceOf(items[0]),
    })
  }

  categories.sort((a, b) => b.count - a.count)

  /*
   * The leading chip. Empty for Həkim qəbulu, where it means "all of them" —
   * the group is 17 items, so the whole group is the first screen.
   */
  const slugs = popular[group.slug]?.slugs ?? []
  const bySlug = new Map(data.items.map((item) => [item.slug, item]))
  const missing = slugs.filter((slug) => !bySlug.has(slug))
  if (missing.length > 0) {
    throw new Error(
      `popular.ts references slugs no longer in the catalogue: ${missing.join(", ")}`
    )
  }

  const featured = slugs.length
    ? slugs.map((slug) => bySlug.get(slug))
    : data.items.filter((item) => item.group === group.slug)

  const popularSlug = `populyar-${group.slug}`
  await writeFile(
    join(OUT, locale, `${popularSlug}.json`),
    JSON.stringify(featured.map((item) => trim(item, locale)))
  )

  categories.unshift({
    slug: popularSlug,
    name: translate(i18n.labels, popular[group.slug]?.label ?? "Populyar", locale),
    count: featured.length,
    from: Math.min(...featured.map(priceOf)),
    featured: true,
  })
  // The leading chip repeats items from the real categories, so it must not be
  // counted again in the group total.
  index.push({
    ...group,
    name: translate(i18n.groups, group.name, locale),
    blurb: translate(i18n.groups, group.blurb, locale),
    count: categories.reduce((n, c) => n + (c.featured ? 0 : c.count), 0),
    categories,
  })
}

await writeFile(join(OUT, locale, "index.json"), JSON.stringify(index))
if (locale === "az") summary = index
if (locale === "az") {
  // The picker asks for /catalog/index.json before it knows the locale on a
  // first paint; keeping the Azerbaijani copy at the old path means that
  // request still answers instead of 404ing.
  await writeFile(join(OUT, "index.json"), JSON.stringify(index))
}
}

console.log(
  `catalog: ${summary.reduce(
    (n, g) => n + g.categories.filter((c) => !c.featured).length,
    0
  )} categories, ` +
    `${summary.reduce((n, g) => n + g.count, 0)} services`
)
