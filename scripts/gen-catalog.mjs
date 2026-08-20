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
const trim = (item) => ({
  slug: item.slug,
  name: item.name,
  code: item.code,
  description: item.description,
  prep: item.prep,
  categoryName: item.categoryName,
  prices: item.prices,
})

const index = []

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
      join(OUT, `${category.slug}.json`),
      JSON.stringify(items.map(trim))
    )

    categories.push({
      slug: category.slug,
      name: category.name,
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
  await writeFile(join(OUT, `${popularSlug}.json`), JSON.stringify(featured.map(trim)))

  categories.unshift({
    slug: popularSlug,
    name: popular[group.slug]?.label ?? "Populyar",
    count: featured.length,
    from: Math.min(...featured.map(priceOf)),
    featured: true,
  })
  // The leading chip repeats items from the real categories, so it must not be
  // counted again in the group total.
  index.push({
    ...group,
    count: categories.reduce((n, c) => n + (c.featured ? 0 : c.count), 0),
    categories,
  })
}

await writeFile(join(OUT, "index.json"), JSON.stringify(index))

console.log(
  `catalog: ${index.reduce(
    (n, g) => n + g.categories.filter((c) => !c.featured).length,
    0
  )} categories, ` +
    `${index.reduce((n, g) => n + g.count, 0)} services`
)
