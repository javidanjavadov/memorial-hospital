"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import type azDict from "@/i18n/dictionaries/az.json"
import { useT } from "@/i18n/client"

/**
 * Auth.js reports a failed sign-in by redirecting to `pages.signIn` with an
 * `?error=` code. Without this the visitor is bounced back to a pristine login
 * form with no indication that anything went wrong.
 *
 * Codes: https://authjs.dev/reference/core/errors
 */
/* Auth.js error code → dictionary key, resolved where the notice renders: a
   module constant is evaluated at import, before any locale is known. */
const MESSAGE_KEYS: Record<string, keyof (typeof azDict)["ui"]> = {
  Configuration: "authConfigError",
  AccessDenied: "authAccessDenied",
  Verification: "authLinkExpired",
  OAuthSignin: "authRedirectFailed",
  OAuthCallback: "authCallbackError",
  OAuthAccountNotLinked: "authEmailTaken",
  Callback: "authIncomplete",
  default: "authUnexpected",
}

function Notice() {
  const t = useT()
  const error = useSearchParams().get("error")
  if (!error) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span>{t.ui[MESSAGE_KEYS[error] ?? MESSAGE_KEYS.default]}</span>
    </div>
  )
}

export default function AuthErrorNotice() {
  // useSearchParams needs a boundary so the rest of the page can stay static.
  return (
    <Suspense fallback={null}>
      <Notice />
    </Suspense>
  )
}
