"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useT } from "@/i18n/client"
import { useCurrentUser } from "@/lib/use-current-user"
import { missingProfileFields } from "@/lib/profile-complete"

/**
 * Paths a signed-in but incomplete account may still reach.
 *
 * /profil is where the details are filled in. The rest are the ways out — the
 * legal pages the consent checkbox links to, and the auth routes, so signing
 * out is never blocked. Trapping someone with no exit would be a worse bug than
 * the one this fixes.
 */
const ALLOWED = ["/profil", "/giris", "/qeydiyyat", "/siyaset", "/sertler"]

/**
 * Holds a signed-in account on /profil until the details the lab needs are
 * filled in.
 *
 * A Google sign-in supplies an email and a display name only. Everything else —
 * patronymic, FIN, date of birth, phone — arrives blank, and an account in that
 * state cannot order, cannot book and cannot be matched to a result. Gating
 * only the submit buttons let someone browse for a while and discover this at
 * the checkout; this sends them straight to the form instead.
 *
 * Deliberately a redirect and not a modal: the address bar stays truthful, Back
 * behaves, and the page can be reloaded without losing the way out.
 */
export default function ProfileGate({ children }: { children: React.ReactNode }) {
  const t = useT()
  const { user, isLoading } = useCurrentUser()
  const pathname = usePathname()
  const router = useRouter()

  const incomplete = !isLoading && !!user && missingProfileFields(user).length > 0
  const blocked = incomplete && !ALLOWED.some((path) => pathname.startsWith(path))

  useEffect(() => {
    if (!blocked) return
    // `replace`, not `push`: a blocked page must not become a Back destination
    // that bounces the visitor straight back here.
    router.replace(`/profil?next=${encodeURIComponent(pathname)}`)
  }, [blocked, pathname, router])

  if (blocked) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center gap-3"
        role="status"
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        <span className="text-[var(--ink-muted)]">
          {t.ui.profileGateLoading}
        </span>
      </div>
    )
  }

  return <>{children}</>
}
