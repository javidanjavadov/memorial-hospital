import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BranchKey } from "@/lib/catalog"
import { DEFAULT_BRANCH } from "@/lib/catalog"

export interface BasketLine {
  slug: string
  /**
   * Who the test is for: the account id for the holder, a family member id
   * otherwise.
   *
   * Optional because baskets persisted before the family feature existed have
   * no patient on them. Those lines are read as belonging to the account
   * holder — see `linePatientId` — rather than being dropped, which would empty
   * a basket somebody had already filled.
   */
  patientId?: string
  /** The patient's name when the line was added, so the basket reads correctly
   *  even if the relative is later removed from the family. */
  patientName?: string
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

/**
 * A line's patient, with the empty string standing for "unassigned".
 *
 * Lines saved before the family feature existed carry no patient. Reading them
 * as one shared bucket keeps an old basket intact and lets the basket page show
 * them under the account holder, which is who they were always for.
 */
export const linePatientId = (line: BasketLine) => line.patientId ?? ""

/**
 * The basket split by patient, in the order each person first appears.
 *
 * The order is the insertion order rather than anything sorted: the groups then
 * match the sequence the tests were added in, so a basket does not rearrange
 * itself underneath someone who is still adding to it.
 */
export const groupLinesByPatient = (lines: BasketLine[]) => {
  const groups = new Map<string, { patientId: string; patientName: string; lines: BasketLine[] }>()

  for (const line of lines) {
    const patientId = linePatientId(line)
    const existing = groups.get(patientId)
    if (existing) {
      existing.lines.push(line)
      // A name arriving on a later line fills in for an older one saved without.
      if (!existing.patientName && line.patientName) {
        existing.patientName = line.patientName
      }
      continue
    }
    groups.set(patientId, {
      patientId,
      patientName: line.patientName ?? "",
      lines: [line],
    })
  }

  return [...groups.values()]
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
  /** Lines carry their own patient, so one order can cover a whole family. */
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
  /**
   * Who lines are added for.
   *
   * Held here rather than passed to every call site because it is a property of
   * the session's intent, not of the button: the picker's first step sets it,
   * and everything added afterwards belongs to that person until it changes.
   */
  activePatientId: string
  /** The active patient's name, so a line can record who it was added for
   *  without every button having to look the patient up. */
  activePatientName: string
  setActivePatient: (id: string, name: string) => void
  add: (line: BasketLine) => void
  remove: (slug: string, patientId?: string) => void
  clear: () => void
  /** Moves the basket into order history and empties it. */
  submit: (userId: string) => PastOrder | null
  reorder: (id: string) => void
  setBranch: (branch: BranchKey) => void
  setHomeCollection: (enabled: boolean) => void
  setPaymentMethod: (method: PaymentMethod) => void
  has: (slug: string, patientId?: string) => boolean
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
      activePatientId: "",
      activePatientName: "",
      branch: DEFAULT_BRANCH,
      homeCollection: false,
      paymentMethod: "CASH",
      hasHydrated: false,

      setHasHydrated: () => set({ hasHydrated: true }),

      setActivePatient: (activePatientId, activePatientName) =>
        set({ activePatientId, activePatientName }),

      add: (line) =>
        set((state) => {
          /*
           * A test is either ordered or not — there is no quantity. Ordering
           * the same blood test twice in one visit is not a thing.
           *
           * Per patient, though: a mother and her son both needing a blood
           * count is two samples and two results, so the identity of a line is
           * the test AND the person, not the test alone. Keying on the slug by
           * itself silently refused the second person's test.
           */
          const patientId = line.patientId ?? state.activePatientId
          const entry = {
            ...line,
            patientId,
            patientName: line.patientName ?? state.activePatientName,
          }
          return state.lines.some(
            (l) => l.slug === entry.slug && linePatientId(l) === patientId
          )
            ? state
            : { lines: [...state.lines, entry] }
        }),

      remove: (slug, patientId) =>
        set((state) => ({
          lines: state.lines.filter(
            (l) =>
              !(
                l.slug === slug &&
                // No patient given means "this test, whoever it is for" — the
                // basket page always passes one.
                (patientId === undefined || linePatientId(l) === patientId)
              )
          ),
        })),

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
          const existing = new Set(
            state.lines.map((l) => `${linePatientId(l)}:${l.slug}`)
          )
          return {
            lines: [
              ...state.lines,
              ...order.lines.filter(
                (l) => !existing.has(`${linePatientId(l)}:${l.slug}`)
              ),
            ],
          }
        }),

      setBranch: (branch) => set({ branch }),
      setHomeCollection: (homeCollection) => set({ homeCollection }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

      has: (slug, patientId) =>
        get().lines.some(
          (l) =>
            l.slug === slug &&
            (patientId === undefined || linePatientId(l) === patientId)
        ),
    }),
    {
      name: "memorial-basket",
      skipHydration: true,
      partialize: (state) => ({
        lines: state.lines,
        orders: state.orders,
        activePatientId: state.activePatientId,
        activePatientName: state.activePatientName,
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
