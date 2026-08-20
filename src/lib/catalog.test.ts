import { describe, expect, it } from "vitest"
import {
  allCategorySlugs,
  catalogItems,
  DEFAULT_BRANCH,
  formatAzn,
  getCategoryItems,
  GROUP_ORDER,
  pickerGroups,
  priceOf,
} from "@/lib/catalog"
import { branches } from "@/data"

describe("catalogue data", () => {
  /*
   * The bug this catches shipped: catalog.json keyed prices as `nerimanov` and
   * `gence` while Branch.id was `nrimanov` and `ganca`, so two of three
   * branches silently showed no price at all. Nothing threw.
   */
  it("prices every item under keys that match a real branch id", () => {
    const ids = new Set(branches.map((b) => b.id))
    const stray = new Set<string>()

    for (const item of catalogItems) {
      for (const key of Object.keys(item.prices)) {
        if (!ids.has(key)) stray.add(key)
      }
    }

    expect([...stray]).toEqual([])
  })

  it("gives every item a usable price", () => {
    const priceless = catalogItems.filter((item) => priceOf(item) <= 0)
    expect(priceless).toEqual([])
  })

  it("has no duplicate category slugs within a group", () => {
    for (const group of pickerGroups()) {
      const slugs = group.categories.map((c) => c.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    }
  })

  it("leads every group with exactly one featured chip", () => {
    for (const group of pickerGroups()) {
      expect(group.categories[0].featured).toBe(true)
      expect(group.categories.filter((c) => c.featured)).toHaveLength(1)
    }
  })

  it("excludes the featured chip from the group's service count", () => {
    for (const group of pickerGroups()) {
      const real = group.categories.filter((c) => !c.featured)
      expect(group.count).toBe(real.reduce((n, c) => n + c.count, 0))
    }
  })

  it("keeps every group in GROUP_ORDER populated", () => {
    for (const group of GROUP_ORDER) {
      const entry = pickerGroups().find((g) => g.slug === group.slug)
      expect(entry, `${group.slug} missing`).toBeDefined()
      expect(entry!.count).toBeGreaterThan(0)
    }
  })

  it("sorts a category cheapest first, so the entry price is honest", () => {
    const items = getCategoryItems("rentgen")
    const prices = items.map((item) => priceOf(item, DEFAULT_BRANCH))
    expect([...prices].sort((a, b) => a - b)).toEqual(prices)
  })

  it("generates a static param for every category with items", () => {
    const slugs = allCategorySlugs()
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) {
      expect(getCategoryItems(slug).length).toBeGreaterThan(0)
    }
  })
})

describe("formatAzn", () => {
  it("keeps whole numbers whole and pads real decimals", () => {
    expect(formatAzn(18)).toBe("18 AZN")
    expect(formatAzn(16.2)).toBe("16.20 AZN")
  })
})
