import { beforeEach, describe, expect, it } from "vitest"
import {
  basketSubtotal,
  HOME_COLLECTION_FEE,
  ordersFor,
  useBasketStore,
  type BasketLine,
} from "@/lib/basket-store"

const line = (slug: string, price: number, promoted?: number): BasketLine => ({
  slug,
  name: `Test ${slug}`,
  code: `LAB-${slug}`,
  price,
  promoted: promoted ?? null,
})

beforeEach(() => {
  useBasketStore.setState({
    lines: [],
    orders: [],
    branch: "nrimanov",
    homeCollection: false,
    paymentMethod: "CASH",
    hasHydrated: true,
  })
})

describe("basketSubtotal", () => {
  it("charges the promoted price when there is one", () => {
    expect(basketSubtotal([line("a", 20, 18), line("b", 10)])).toBe(28)
  })

  /* A "promotion" above the list price is bad data, not a price rise. */
  it("ignores a promoted price that is higher than the list price", () => {
    expect(basketSubtotal([line("a", 10, 15)])).toBe(10)
  })
})

describe("basket", () => {
  it("never adds the same test twice", () => {
    const { add } = useBasketStore.getState()
    add(line("a", 10))
    add(line("a", 10))
    expect(useBasketStore.getState().lines).toHaveLength(1)
  })

  it("submits the basket into history and empties it", () => {
    const store = useBasketStore.getState()
    store.add(line("a", 20, 18))
    store.add(line("b", 10))
    store.setHomeCollection(true)
    store.setPaymentMethod("CARD")

    const order = useBasketStore.getState().submit("patient-1")

    expect(order).not.toBeNull()
    expect(order!.total).toBe(18 + 10 + HOME_COLLECTION_FEE)
    expect(order!.paymentMethod).toBe("CARD")
    expect(order!.userId).toBe("patient-1")
    expect(useBasketStore.getState().lines).toEqual([])
    expect(useBasketStore.getState().orders).toHaveLength(1)
  })

  it("refuses to submit an empty basket", () => {
    expect(useBasketStore.getState().submit("patient-1")).toBeNull()
  })

  /*
   * The store is shared by everyone using the browser. Without this, a second
   * account on a family computer would be shown the first one's laboratory
   * tests — which are health data.
   */
  it("shows a patient only their own orders", () => {
    const store = useBasketStore.getState()
    store.add(line("a", 10))
    useBasketStore.getState().submit("patient-1")
    useBasketStore.getState().add(line("b", 10))
    useBasketStore.getState().submit("patient-2")

    const all = useBasketStore.getState().orders
    expect(ordersFor(all, "patient-1")).toHaveLength(1)
    expect(ordersFor(all, "patient-2")).toHaveLength(1)
    expect(ordersFor(all, undefined)).toEqual([])
  })

  it("reorders without duplicating what is already in the basket", () => {
    const store = useBasketStore.getState()
    store.add(line("a", 10))
    store.add(line("b", 10))
    const order = useBasketStore.getState().submit("patient-1")!

    useBasketStore.getState().add(line("a", 10))
    useBasketStore.getState().reorder(order.id)

    const slugs = useBasketStore.getState().lines.map((l) => l.slug)
    expect(slugs).toEqual(["a", "b"])
  })
})
