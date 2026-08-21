import { beforeEach, describe, expect, it } from "vitest"
import {
  basketSubtotal,
  HOME_COLLECTION_FEE,
  ordersFor,
  useBasketStore,
  type BasketLine,
  lineName,
  linePatientId,
  groupLinesByPatient,
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
    activePatientId: "",
    activePatientName: "",
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

describe("lineName", () => {
  /*
   * A basket outlives a language switch: it is built in one language, kept in
   * localStorage and read back in another. Without the per-language names the
   * lines keep speaking the language they were added in, which is exactly what
   * a browser check caught.
   */
  const line = {
    slug: "a",
    name: "Ümumi xolesterol",
    names: { az: "Ümumi xolesterol", ru: "Общий холестерин", en: "Total Cholesterol" },
    price: 10,
  }

  it("renders the line in the language being read", () => {
    expect(lineName(line, "ru")).toBe("Общий холестерин")
    expect(lineName(line, "en")).toBe("Total Cholesterol")
    expect(lineName(line, "az")).toBe("Ümumi xolesterol")
  })

  it("falls back to the stored name for a language it has no entry for", () => {
    expect(lineName(line, "tr")).toBe("Ümumi xolesterol")
  })

  it("falls back for a line saved before names were stored", () => {
    expect(lineName({ slug: "b", name: "Qlükoza", price: 3 }, "ru")).toBe("Qlükoza")
  })
})

/*
 * The same test can legitimately be in the basket twice — a mother and her son
 * both needing a blood count is two samples and two results. The identity of a
 * line is therefore the test AND the person, which is what these pin down.
 */
describe("per-patient lines", () => {
  const forPatient = (
    slug: string,
    patientId: string,
    patientName: string
  ): BasketLine => ({ ...line(slug, 10), patientId, patientName })

  it("keeps the same test for two different patients", () => {
    const { add } = useBasketStore.getState()
    add(forPatient("cbc", "mum", "Cavadova Aysel"))
    add(forPatient("cbc", "son", "Cavadov Kanan"))

    expect(useBasketStore.getState().lines).toHaveLength(2)
  })

  it("still refuses the same test twice for one patient", () => {
    const { add } = useBasketStore.getState()
    add(forPatient("cbc", "mum", "Cavadova Aysel"))
    add(forPatient("cbc", "mum", "Cavadova Aysel"))

    expect(useBasketStore.getState().lines).toHaveLength(1)
  })

  it("tags a line with the active patient when it carries none", () => {
    useBasketStore.getState().setActivePatient("mum", "Cavadova Aysel")
    useBasketStore.getState().add(line("cbc", 10))

    const [entry] = useBasketStore.getState().lines
    expect(entry.patientId).toBe("mum")
    expect(entry.patientName).toBe("Cavadova Aysel")
  })

  /* Removing one person's test must not take the other person's with it. */
  it("removes only the named patient's copy", () => {
    const { add } = useBasketStore.getState()
    add(forPatient("cbc", "mum", "Cavadova Aysel"))
    add(forPatient("cbc", "son", "Cavadov Kanan"))

    useBasketStore.getState().remove("cbc", "mum")

    const { lines } = useBasketStore.getState()
    expect(lines).toHaveLength(1)
    expect(lines[0].patientId).toBe("son")
  })

  it("reports `has` per patient", () => {
    useBasketStore.getState().add(forPatient("cbc", "mum", "Cavadova Aysel"))

    expect(useBasketStore.getState().has("cbc", "mum")).toBe(true)
    expect(useBasketStore.getState().has("cbc", "son")).toBe(false)
  })
})

describe("linePatientId", () => {
  /* A basket saved before the family feature existed has no patient on its
     lines; those belong to the account holder, not to nobody. */
  it("reads a line with no patient as the unassigned bucket", () => {
    expect(linePatientId(line("cbc", 10))).toBe("")
  })
})

describe("groupLinesByPatient", () => {
  it("groups in the order each patient first appears", () => {
    const groups = groupLinesByPatient([
      { ...line("cbc", 10), patientId: "mum", patientName: "Cavadova Aysel" },
      { ...line("vitd", 35), patientId: "son", patientName: "Cavadov Kanan" },
      { ...line("tsh", 12), patientId: "mum", patientName: "Cavadova Aysel" },
    ])

    expect(groups.map((g) => g.patientId)).toEqual(["mum", "son"])
    expect(groups[0].lines).toHaveLength(2)
    expect(groups[1].lines).toHaveLength(1)
  })

  it("carries the patient name onto the group", () => {
    const groups = groupLinesByPatient([
      { ...line("cbc", 10), patientId: "mum", patientName: "Cavadova Aysel" },
    ])
    expect(groups[0].patientName).toBe("Cavadova Aysel")
  })
})
