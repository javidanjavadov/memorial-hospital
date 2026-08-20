import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BranchKey } from "@/lib/catalog"
import { DEFAULT_BRANCH } from "@/lib/catalog"

export interface BasketLine {
  slug: string
  name: string
  /**
   * The name in every language, when the catalogue supplied it.
   *
   * A basket outlives a language switch: it is built in one language, kept in
   * localStorage, and read back in another. Without this the lines would still
   * be speaking the language they were added in — which is exactly what
   * happened.
   */
  names?: Partial<Record<"az" | "ru" | "en" | "tr", string>>
  code?: string
  /** Unit price in AZN at the time it was added, for display only. */
  price: number
  promoted?: number | null
}

/** Home sample collection, matching the fee the hospital charges. */
export const HOME_COLLECTION_FEE = 5

/**
 * How the patient intends to settle. Payment itself happens at the branch —
 * the site takes none — so this records intent for the cash desk, nothing more.
 */
export type PaymentMethod = "CASH" | "CARD"

export interface PastOrder {
  id: string
  /**
   * Who placed it. The store is shared by everyone using this browser, so
   * without it a second account on the same machine would see the first
   * account's orders — which are laboratory tests, not shopping.
   */
  userId: string
  createdAt: string
  branch: BranchKey
  homeCollection: boolean
  paymentMethod: PaymentMethod
  total: number
  lines: BasketLine[]
}

interface BasketState {
  lines: BasketLine[]
  /** Orders already submitted, newest first. Local to this browser. */
  orders: PastOrder[]
  branch: BranchKey
  homeCollection: boolean
  paymentMethod: PaymentMethod
  hasHydrated: boolean
  setHasHydrated: () => void
  add: (line: BasketLine) => void
  remove: (slug: string) => void
  clear: () => void
  /** Moves the basket into order history and empties it. */
  submit: (userId: string) => PastOrder | null
  reorder: (id: string) => void
  setBranch: (branch: BranchKey) => void
  setHomeCollection: (enabled: boolean) => void
  setPaymentMethod: (method: PaymentMethod) => void
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
      orders: [],
      branch: DEFAULT_BRANCH,
      homeCollection: false,
      paymentMethod: "CASH",
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

      submit: (userId) => {
        const { lines, branch, homeCollection, paymentMethod } = get()
        if (lines.length === 0) return null

        const order: PastOrder = {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : String(Date.now()),
          userId,
          createdAt: new Date().toISOString(),
          branch,
          homeCollection,
          paymentMethod,
          total:
            basketSubtotal(lines) + (homeCollection ? HOME_COLLECTION_FEE : 0),
          lines,
        }

        set((state) => ({
          orders: [order, ...state.orders],
          lines: [],
          homeCollection: false,
        }))
        return order
      },

      /** Puts a past order's tests back in the basket, skipping any already in it. */
      reorder: (id) =>
        set((state) => {
          const order = state.orders.find((o) => o.id === id)
          if (!order) return state
          const existing = new Set(state.lines.map((l) => l.slug))
          return {
            lines: [
              ...state.lines,
              ...order.lines.filter((l) => !existing.has(l.slug)),
            ],
          }
        }),

      setBranch: (branch) => set({ branch }),
      setHomeCollection: (homeCollection) => set({ homeCollection }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

      has: (slug) => get().lines.some((l) => l.slug === slug),
    }),
    {
      name: "memorial-basket",
      skipHydration: true,
      partialize: (state) => ({
        lines: state.lines,
        orders: state.orders,
        branch: state.branch,
        homeCollection: state.homeCollection,
        paymentMethod: state.paymentMethod,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated()
      },
    }
  )
)

/** This browser's orders belonging to one account. */
export const ordersFor = (orders: PastOrder[], userId: string | undefined) =>
  userId ? orders.filter((order) => order.userId === userId) : []

/** A line's name in the current language, falling back to what was stored. */
export const lineName = (line: BasketLine, locale: string) =>
  line.names?.[locale as "az"] ?? line.name

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
