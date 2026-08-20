import { NextResponse } from "next/server"
import { isLocale, LOCALE_COOKIE } from "@/i18n/config"

/**
 * Stores the visitor's language choice.
 *
 * A cookie rather than a URL prefix, for now: the site has 72 statically
 * rendered category pages, and prefixing every route would multiply them by
 * four before a single string was translated. The strings are externalised
 * either way, so moving to /ru/... later is mechanical rather than a rewrite.
 *
 * The trade-off is real and worth stating: without a distinct URL per language,
 * search engines index only the Azerbaijani version. That is the next step, not
 * an oversight.
 */
export async function POST(request: Request) {
  const { locale } = await request.json().catch(() => ({ locale: null }))

  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Unknown locale" }, { status: 400 })
  }

  const response = NextResponse.json({ ok: true, locale })

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    // Readable by script deliberately: it carries a language choice, nothing
    // about the person, and the switcher reads it to show the current state.
    httpOnly: false,
  })

  return response
}
