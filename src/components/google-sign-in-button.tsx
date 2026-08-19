"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

/** Google's brand mark. Google's terms require their own logo, unmodified. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.9h3.72c2.18-2 3.44-4.96 3.44-8.56Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.11 0 5.72-1.03 7.62-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.55-2.03-6.46-4.76H1.7v2.99A11.5 11.5 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.54 14.66a6.9 6.9 0 0 1 0-4.4V7.27H1.7a11.5 11.5 0 0 0 0 10.38l3.84-3Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.69 0 3.2.58 4.4 1.72l3.3-3.29C17.71 1.19 15.1 0 12 0A11.5 11.5 0 0 0 1.7 7.27l3.84 2.99C6.45 7.53 9 4.75 12 4.75Z"
      />
    </svg>
  )
}

export default function GoogleSignInButton({
  label = "Google ilə davam et",
  callbackUrl = "/profil",
}: {
  label?: string
  callbackUrl?: string
}) {
  const [isSigningIn, setIsSigningIn] = useState(false)

  /*
   * Clear the pending state when the visitor comes back without signing in.
   *
   * Pressing Back from Google restores this page from the browser's
   * back/forward cache, which does NOT remount React — so `isSigningIn` stayed
   * true and the button was left permanently disabled reading "Yönləndirilir...".
   *
   * `pageshow` with `persisted` covers the bfcache restore; `visibilitychange`
   * covers browsers that do not use bfcache here (and the case where the
   * redirect never actually happened).
   */
  useEffect(() => {
    const reset = () => setIsSigningIn(false)

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) reset()
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") reset()
    }

    window.addEventListener("pageshow", onPageShow)
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      window.removeEventListener("pageshow", onPageShow)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      disabled={isSigningIn}
      onClick={() => {
        setIsSigningIn(true)
        /*
         * If the redirect does not happen — offline, popup blocked, provider
         * misconfigured — nothing else would ever clear this, so release the
         * button rather than leaving it dead.
         */
        signIn("google", { callbackUrl }).catch(() => setIsSigningIn(false))
        window.setTimeout(() => setIsSigningIn(false), 10_000)
      }}
    >
      {isSigningIn ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      ) : (
        <GoogleMark />
      )}
      {isSigningIn ? "Yönləndirilir..." : label}
    </Button>
  )
}
