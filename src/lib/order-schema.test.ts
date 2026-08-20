import { describe, expect, it } from "vitest"
import { orderPayloadSchema, orderReference } from "@/lib/order-schema"

const payload = {
  branch: "nrimanov",
  homeCollection: false,
  paymentMethod: "CASH",
  quotedTotal: 28,
  lines: [
    { slug: "ferritin", name: "Ferritin", code: "LAB-01", quotedPrice: 18 },
    { slug: "qlukoza", name: "Qlükoza", code: "LAB-02", quotedPrice: 10 },
  ],
}

describe("orderPayloadSchema", () => {
  it("accepts a well-formed order", () => {
    expect(orderPayloadSchema.safeParse(payload).success).toBe(true)
  })

  it("rejects an empty basket", () => {
    expect(
      orderPayloadSchema.safeParse({ ...payload, lines: [] }).success
    ).toBe(false)
  })

  it("rejects a branch the hospital does not have", () => {
    expect(
      orderPayloadSchema.safeParse({ ...payload, branch: "istanbul" }).success
    ).toBe(false)
  })

  it("rejects a payment method that is not offered", () => {
    expect(
      orderPayloadSchema.safeParse({ ...payload, paymentMethod: "CRYPTO" }).success
    ).toBe(false)
  })

  it("rejects a negative price", () => {
    const lines = [{ ...payload.lines[0], quotedPrice: -5 }]
    expect(orderPayloadSchema.safeParse({ ...payload, lines }).success).toBe(false)
  })

  /*
   * The patient is read from the session, never the body. Anything sent under
   * that name is dropped rather than trusted — otherwise an order could be
   * filed against someone else's FIN.
   */
  it("drops a patient supplied by the caller", () => {
    const parsed = orderPayloadSchema.parse({
      ...payload,
      patient: { finCode: "AAA1111", fullName: "Someone Else" },
    })
    expect("patient" in parsed).toBe(false)
  })
})

describe("orderReference", () => {
  it("is readable over the phone and unique per order", () => {
    const a = orderReference(1_700_000_000_000, "ab12")
    const b = orderReference(1_700_000_000_001, "ab12")
    expect(a).toMatch(/^MH-[0-9A-Z]+-[0-9A-Z]{4}$/)
    expect(a).not.toBe(b)
  })
})
