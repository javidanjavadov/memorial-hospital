import * as z from "zod"

/**
 * The shape of an order as it leaves this site.
 *
 * Deliberately independent of the basket store: this is the contract with
 * whatever receives orders — a webhook today, the hospital's own HIS later —
 * and it should not change every time the UI does. Everything the receiving end
 * needs to file the order and phone the patient is in here, and nothing else.
 *
 * Prices are included as *quoted*, and named that way. The branch's own price
 * list is authoritative at the desk; sending our figure lets the receiver spot
 * a mismatch instead of silently honouring or ignoring it.
 */
export const orderLineSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  /** Hospital's own service code. Empty for consultations, which have none. */
  code: z.string(),
  quotedPrice: z.number().nonnegative(),
})

export const orderPayloadSchema = z.object({
  branch: z.enum(["nrimanov", "qarayev", "ganca"]),
  homeCollection: z.boolean(),
  paymentMethod: z.enum(["CASH", "CARD"]),
  lines: z.array(orderLineSchema).min(1, "Səbət boşdur").max(200),
  quotedTotal: z.number().nonnegative(),
  /** Free-text note from the patient. */
  note: z.string().max(1000).optional(),
})

export type OrderPayload = z.infer<typeof orderPayloadSchema>
export type OrderLine = z.infer<typeof orderLineSchema>

/** The patient the order is filed against, taken from the session — never from
 *  the request body, or the sender could file an order in someone else's name. */
export interface OrderPatient {
  id: string
  fullName: string
  firstName: string
  lastName: string
  fatherName: string
  gender: "MALE" | "FEMALE"
  birthDate: string
  finCode: string
  phone: string
  email: string
}

/** What is actually transmitted, and what is written to the log. */
export interface OutboundOrder {
  /** Our reference, shown to the patient and quoted on the phone. */
  reference: string
  createdAt: string
  source: "web"
  patient: OrderPatient
  order: OrderPayload
}

/**
 * Short, human-readable reference: MH-<base36 time>-<4 random>.
 *
 * Read aloud over the phone, so it avoids a raw UUID. Not a security token —
 * knowing one grants nothing, because nothing is looked up by it here.
 */
export function orderReference(now: number, random: string) {
  return `MH-${now.toString(36).toUpperCase()}-${random.toUpperCase()}`
}
