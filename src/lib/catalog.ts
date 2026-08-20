import catalogData from "@/data/catalog.json"
import popularData from "@/data/popular.json"

/**
 * The hospital's real service catalogue — 1168 lab tests, imaging studies and
 * consultations, pulled from api.memorialhospital.az with their live codes,
 * prices, preparation times and descriptions.
 *
 * SERVER ONLY. The JSON is ~500KB; importing it from a Client Component would
 * ship the whole catalogue to the browser. Every page that uses it renders one
 * category at a time on the server, so only those rows reach the HTML.
 */

/** Must match `Branch.id` in @/data — the price keys in catalog.json are
 *  keyed by it, and a mismatch silently drops branches from the price table. */
export type BranchKey = "nrimanov" | "qarayev" | "ganca"

export interface CatalogPrice {
  price: number
  promoted: number | null
}

export interface CatalogItem {
  slug: string
  name: string
  description: string
  /** Hospital's own code, e.g. LAB-01-0002. */
  code: string
  /** Preparation time, already humanised: "1 gün", "1 - 2 gün". */
  prep: string
  category: string
  categoryName: string
  group: string
  prices: Partial<Record<BranchKey, CatalogPrice>>
}

export interface CatalogCategory {
  id: string
  slug: string
  name: string
  itemCount: number
  parent: string | null
  depth: number
}

export interface CatalogGroup {
  slug: string
  name: string
  categories: CatalogCategory[]
}

const data = catalogData as unknown as {
  groups: CatalogGroup[]
  items: CatalogItem[]
}

export const catalogGroups = data.groups
export const catalogItems = data.items

/** Human labels for the top-level groups, in the order the hospital lists them. */
export const GROUP_ORDER: { slug: string; name: string; blurb: string }[] = [
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

const itemsByCategory = new Map<string, CatalogItem[]>()
for (const item of catalogItems) {
  const list = itemsByCategory.get(item.category)
  if (list) list.push(item)
  else itemsByCategory.set(item.category, [item])
}

const categoryBySlug = new Map<string, CatalogCategory & { group: string }>()
for (const group of catalogGroups) {
  for (const category of group.categories) {
    categoryBySlug.set(category.slug, { ...category, group: group.slug })
  }
}

export const getCategory = (slug: string) => categoryBySlug.get(slug)

/** Items in a category, cheapest first so the entry price is visible up front. */
export const getCategoryItems = (slug: string): CatalogItem[] =>
  (itemsByCategory.get(slug) ?? [])
    .slice()
    .sort((a, b) => priceOf(a) - priceOf(b))

export const getGroup = (slug: string) =>
  catalogGroups.find((g) => g.slug === slug)

/** Categories of a group that actually have items, largest first. */
export const getGroupCategories = (groupSlug: string) => {
  const seen = new Set<string>()
  return (getGroup(groupSlug)?.categories ?? [])
    .map((c) => ({ ...c, count: itemsByCategory.get(c.slug)?.length ?? 0 }))
    .filter((c) => {
      // "Allergik analizlər" is listed twice upstream under one slug. Two
      // entries sharing a slug are one category — and a duplicated React key
      // left a stale chip behind when the group changed.
      if (c.count === 0 || seen.has(c.slug)) return false
      seen.add(c.slug)
      return true
    })
    .sort((a, b) => b.count - a.count)
}

/**
 * Every category slug, for generateStaticParams.
 *
 * Deduplicated: "Allergik analizlər" is listed twice upstream under one slug,
 * and handing the same param to generateStaticParams twice builds the same page
 * twice. getGroupCategories already drops it, so without this the strip and the
 * static routes disagreed about how many categories exist.
 */
export const allCategorySlugs = () => [
  ...new Set(
    catalogGroups.flatMap((g) =>
      g.categories
        .filter((c) => (itemsByCategory.get(c.slug)?.length ?? 0) > 0)
        .map((c) => c.slug)
    )
  ),
]

/**
 * Nərimanov is the hospital's own default branch, and only 18 of 1168 items are
 * priced differently anywhere — so it is the sensible figure to lead with, with
 * the branch named next to it rather than implied.
 */
export const DEFAULT_BRANCH: BranchKey = "nrimanov"

export const priceOf = (item: CatalogItem, branch: BranchKey = DEFAULT_BRANCH) =>
  item.prices[branch]?.price ?? Object.values(item.prices)[0]?.price ?? 0

export const promotedPriceOf = (
  item: CatalogItem,
  branch: BranchKey = DEFAULT_BRANCH
) => item.prices[branch]?.promoted ?? null

export const formatAzn = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(2)} AZN`

export const catalogTotals = {
  items: catalogItems.length,
  categories: catalogGroups.reduce((n, g) => n + g.categories.length, 0),
}

/**
 * Group → category index for the picker on /xidmetler: names, counts and entry
 * prices only. Rendered with the page; the tests themselves are fetched per
 * category from public/catalog/, generated by scripts/gen-catalog.mjs.
 */
export const pickerGroups = () =>
  GROUP_ORDER.map((group) => {
    const categories = getGroupCategories(group.slug).map((category) => ({
      slug: category.slug,
      name: category.name,
      count: category.count,
      from: priceOf(getCategoryItems(category.slug)[0]),
      featured: false,
    }))

    // Mirrors scripts/gen-catalog.mjs, which writes the matching JSON file.
    // Both read src/data/popular.json, so the chip rendered with the page and
    // the list it fetches cannot disagree.
    const entry = (popularData.groups as Record<string, PopularGroup>)[group.slug]
    const featured = entry?.slugs.length
      ? entry.slugs
          .map((slug) => catalogItems.find((item) => item.slug === slug))
          .filter((item): item is CatalogItem => Boolean(item))
      : catalogItems.filter((item) => item.group === group.slug)

    categories.unshift({
      slug: `populyar-${group.slug}`,
      name: entry?.label ?? "Populyar",
      count: featured.length,
      from: Math.min(...featured.map((item) => priceOf(item))),
      featured: true,
    })

    return {
      ...group,
      count: categories.reduce((n, c) => n + (c.featured ? 0 : c.count), 0),
      categories,
    }
  })

interface PopularGroup {
  label: string
  slugs: string[]
}
