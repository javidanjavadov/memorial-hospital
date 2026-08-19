"use client"

import { useEffect, useState } from "react"
import { getProviders } from "next-auth/react"
import GoogleSignInButton from "@/components/google-sign-in-button"

/**
 * Renders the Google button and its divider only when Google is actually
 * configured.
 *
 * `googleConfigured` in auth.ts is a server-only value (the credentials are not
 * `NEXT_PUBLIC_*`, and must never be), and a Client Component page cannot be
 * handed props by its server layout. Asking Auth.js which providers are
 * registered keeps it to one source of truth instead of a second env var that
 * could drift out of sync.
 */
export default function GoogleAuthSection({ label }: { label?: string }) {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    getProviders()
      .then((providers) => {
        if (active) setEnabled(Boolean(providers?.google))
      })
      .catch(() => {
        if (active) setEnabled(false)
      })
    return () => {
      active = false
    }
  }, [])

  // `null` while unknown: rendering the button first and pulling it away would
  // shift the form under the pointer.
  if (!enabled) return null

  return (
    <>
      <GoogleSignInButton label={label} />
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs uppercase tracking-wide text-slate-400">
            və ya
          </span>
        </div>
      </div>
    </>
  )
}
