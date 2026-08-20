import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDictionary, getLocale } from "@/i18n"
import { resultsForEmail, toPublicResult } from "@/lib/results-store"

/**
 * The signed-in patient's own laboratory results.
 *
 * Scoped by the session email, never by anything in the request: an id in a
 * query string would let one patient read another's report by changing a
 * number. There is no "look up by id" here at all — you get yours, or nothing.
 */
export async function GET() {
  const locale = await getLocale()
  const t = await getDictionary(locale)
  const session = await auth()
  const email = session?.user?.email

  if (!email) {
    return NextResponse.json({ error: t.ui.sessionNotFound }, { status: 401 })
  }

  const results = await resultsForEmail(email)

  return NextResponse.json(
    { results: results.map((result) => toPublicResult(result, locale)) },
    // Medical data: never cached by a proxy, a CDN or the browser's history.
    { headers: { "Cache-Control": "no-store, private" } }
  )
}
