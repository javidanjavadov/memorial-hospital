import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BranchKey } from "@/lib/catalog"
import { DEFAULT_BRANCH } from "@/lib/catalog"

export interface BasketLine {
  slug: string
  name: string
  code?: string
  /** Unit price in AZN at the time it was added, for display only. */
  price: number
  promoted?: number | null
}

/** Home sample collection, matching the fee the hospital charges. */
export const HOME_COLLECTION_FEE = 5

interface BasketState {
  lines: BasketLine[]
  branch: BranchKey
  homeCollection: boolean
  hasHydrated: boolean
  setHasHydrated: () => void
  add: (line: BasketLine) => void
  remove: (slug: string) => void
  clear: () => void
  setBranch: (branch: BranchKey) => void
  setHomeCollection: (enabled: boolean) => void
  has: (slug: string) => boolean
}

/**
 * Basket for laboratory tests.
 *
 * Prices are per branch, so the basket carries the branch it was priced
 * against. Everything here is display state — the authoritative price is
 * whatever the branch charges when the order is confirmed, which is why the
 * basket page says so rather than presenting its total as a bill.
 *
 * Deliberately does NOT take payment. See src/app/sebet/page.tsx.
 */
export const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      lines: [],
      branch: DEFAULT_BRANCH,
      homeCollection: false,
      hasHydrated: false,

      setHasHydrated: () => set({ hasHydrated: true }),

      add: (line) =>
        set((state) =>
          // A test is either ordered or not — there is no quantity. Ordering
          // the same blood test twice in one visit is not a thing.
          state.lines.some((l) => l.slug === line.slug)
            ? state
            : { lines: [...state.lines, line] }
        ),

      remove: (slug) =>
        set((state) => ({ lines: state.lines.filter((l) => l.slug !== slug) })),

      clear: () => set({ lines: [], homeCollection: false }),

      setBranch: (branch) => set({ branch }),
      setHomeCollection: (homeCollection) => set({ homeCollection }),

      has: (slug) => get().lines.some((l) => l.slug === slug),
    }),
    {
      name: "memorial-basket",
      skipHydration: true,
      partialize: (state) => ({
        lines: state.lines,
        branch: state.branch,
        homeCollection: state.homeCollection,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated()
      },
    }
  )
)

/** Sum of the effective (discounted where available) line prices. */
export const basketSubtotal = (lines: BasketLine[]) =>
  lines.reduce(
    (total, line) =>
      total +
      (line.promoted != null && line.promoted < line.price
        ? line.promoted
        : line.price),
    0
  )
