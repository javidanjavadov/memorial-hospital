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

const index = []

for (const group of GROUPS) {
  const source = data.groups.find((g) => g.slug === group.slug)
  if (!source) continue

  const categories = []
  for (const category of source.categories) {
    const items = (byCategory.get(category.slug) ?? [])
      .slice()
      .sort((a, b) => priceOf(a) - priceOf(b))
    if (items.length === 0) continue

    await writeFile(
      join(OUT, `${category.slug}.json`),
      JSON.stringify(
        items.map((item) => ({
          slug: item.slug,
          name: item.name,
          code: item.code,
          description: item.description,
          prep: item.prep,
          categoryName: item.categoryName,
          prices: item.prices,
        }))
      )
    )

    categories.push({
      slug: category.slug,
      name: category.name,
      count: items.length,
      from: priceOf(items[0]),
    })
  }

  categories.sort((a, b) => b.count - a.count)
  index.push({ ...group, count: categories.reduce((n, c) => n + c.count, 0), categories })
}

await writeFile(join(OUT, "index.json"), JSON.stringify(index))

console.log(
  `catalog: ${index.reduce((n, g) => n + g.categories.length, 0)} categories, ` +
    `${index.reduce((n, g) => n + g.count, 0)} services`
)
