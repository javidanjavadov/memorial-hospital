import { NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  orderPayloadSchema,
  orderReference,
  type OutboundOrder,
} from "@/lib/order-schema"

/**
 * Receives an order and hands it to the hospital.
 *
 * The delivery target is configuration, not code:
 *
 *   ORDERS_WEBHOOK_URL    where to POST the order (their HIS, a mail service,
 *                         an automation endpoint — anything that accepts JSON)
 *   ORDERS_WEBHOOK_TOKEN  optional, sent as `Authorization: Bearer …`
 *
 * With no URL set the order is accepted, logged and reported back as
 * `delivered: false`, and the basket says plainly that the clinic has to be
 * phoned. That is the honest state of a site with no backend behind it — the
 * alternative, pretending it arrived, is how someone ends up waiting at home
 * for a call nobody was told to make.
 *
 * When the hospital connects their endpoint, only the two variables change.
 */
export async function POST(request: Request) {
  const session = await auth()
  const account = session?.user

  if (!account?.email) {
    return NextResponse.json({ error: "Sessiya tapılmadı" }, { status: 401 })
  }

  /*
   * The patient comes from the session, never from the request body. Taking
   * these from the caller would let anyone file an order — and a laboratory
   * sample — in someone else's name and FIN.
   */
  const profile = account.profile
  if (!profile) {
    return NextResponse.json(
      { error: "Profil tamamlanmayıb", code: "PROFILE_INCOMPLETE" },
      { status: 409 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Yanlış sorğu" }, { status: 400 })
  }

  const parsed = orderPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Sifariş məlumatları düzgün deyil" },
      { status: 400 }
    )
  }

  const outbound: OutboundOrder = {
    reference: orderReference(
      Date.now(),
      Math.random().toString(36).slice(2, 6)
    ),
    createdAt: new Date().toISOString(),
    source: "web",
    patient: {
      id: account.id,
      email: account.email,
      fullName: profile.fullName,
      firstName: profile.firstName,
      lastName: profile.lastName,
      fatherName: profile.fatherName,
      gender: profile.gender,
      birthDate: profile.birthDate,
      finCode: profile.finCode,
      phone: profile.phone,
    },
    order: parsed.data,
  }

  const target = process.env.ORDERS_WEBHOOK_URL

  if (!target) {
    /*
     * No target configured. Logged with the reference so a support call can be
     * traced through the platform logs, and without the FIN or the test list —
     * those are health data and logs are the least protected place on a server.
     */
    console.info(
      `[order] ${outbound.reference} accepted, no ORDERS_WEBHOOK_URL configured ` +
        `(${outbound.order.lines.length} services, ${outbound.order.branch})`
    )
    return NextResponse.json({
      ok: true,
      delivered: false,
      reference: outbound.reference,
    })
  }

  try {
    const response = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.ORDERS_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.ORDERS_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(outbound),
      // Bounded: a hanging receiver must not hold the patient on a spinner.
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      console.error(
        `[order] ${outbound.reference} rejected by receiver: ${response.status}`
      )
      return NextResponse.json(
        {
          ok: false,
          delivered: false,
          reference: outbound.reference,
          error: "Sifariş göndərilə bilmədi",
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ok: true,
      delivered: true,
      reference: outbound.reference,
    })
  } catch (error) {
    console.error(
      `[order] ${outbound.reference} delivery failed:`,
      error instanceof Error ? error.message : error
    )
    return NextResponse.json(
      {
        ok: false,
        delivered: false,
        reference: outbound.reference,
        error: "Sifariş göndərilə bilmədi",
      },
      { status: 502 }
    )
  }
}
