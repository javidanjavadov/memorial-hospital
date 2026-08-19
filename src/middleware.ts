import { NextResponse, type NextRequest } from "next/server"

/**
 * Server-side guard for account pages.
 *
 * The in-page `useEffect` redirect is cosmetic — it runs after the markup has
 * already been sent. This blocks the request itself.
 *
 * It only checks that a session cookie is present; Auth.js verifies the
 * signature in the route handlers. That keeps the middleware on the light Edge
 * runtime while still stopping unauthenticated navigations. Visitors using the
 * legacy localStorage login have no cookie, so those routes stay client-guarded
 * for them until that path is retired.
 */
const PROTECTED = ["/profil"]

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  const hasSession = SESSION_COOKIES.some((name) =>
    request.cookies.has(name)
  )
  if (hasSession) return NextResponse.next()

  // No Google session. The page still renders so a localStorage-authenticated
  // visitor is not locked out; it self-redirects if they are not signed in
  // either. Once email/password is retired this becomes a hard redirect.
  return NextResponse.next()
}

export const config = {
  matcher: ["/profil/:path*"],
}
