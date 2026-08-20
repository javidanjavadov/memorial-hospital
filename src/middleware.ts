import { NextResponse } from "next/server"
import { auth } from "@/auth"

/**
 * Server-side gate. This is the one that counts.
 *
 * The in-page guards are cosmetic — they run after the markup has been sent,
 * and every value they read comes from the browser. This decides on the request
 * itself, from the signed session cookie, which the browser cannot forge.
 *
 * Two rules:
 *
 * 1. An account page with no session is sent to /giris.
 * 2. A session whose profile is incomplete may only reach /profil. Google gives
 *    us an email and a display name; the laboratory needs a patronymic, a date
 *    of birth and a FIN, and an order filed without them cannot be matched to a
 *    person or a reference range.
 */

/*
 * Only the account pages need a session. The basket and the booking form stay
 * open to visitors who are not signed in — a guest can price up a basket, and
 * the booking form collects a name and a phone number itself. Losing that would
 * cost real bookings to protect nothing.
 */
const REQUIRES_SESSION = ["/profil"]

/** Reachable while the profile is still incomplete: the form, and the exits. */
const ALLOWED_WHILE_INCOMPLETE = ["/profil", "/giris", "/qeydiyyat", "/api"]

export default auth((request) => {
  const { pathname } = request.nextUrl
  const session = request.auth

  const needsSession = REQUIRES_SESSION.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (!session?.user) {
    if (!needsSession) return NextResponse.next()

    const target = new URL("/giris", request.nextUrl)
    target.searchParams.set("next", pathname)
    return NextResponse.redirect(target)
  }

  if (session.user.profile) return NextResponse.next()

  const allowed = ALLOWED_WHILE_INCOMPLETE.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
  if (allowed) return NextResponse.next()

  /*
   * Everything else goes to the form. Signing out is never blocked — /giris is
   * on the allowed list and the header's Çıxış posts to /api/auth. Trapping
   * someone with no way out would be a worse bug than the one this fixes.
   */
  const target = new URL("/profil", request.nextUrl)
  target.searchParams.set("next", pathname)
  return NextResponse.redirect(target)
})

export const config = {
  /*
   * Everything except Next's own assets and the public catalogue JSON. The
   * catalogue is exempt because it is public data and the picker fetches it on
   * every category change — running auth on those would be pure latency.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|catalog/|.*\\.(?:png|jpg|jpeg|webp|svg|ico|txt|xml)$).*)",
  ],
}
