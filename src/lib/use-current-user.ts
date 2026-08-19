"use client"

import { useSession } from "next-auth/react"
import { useAuthStore, type User } from "@/lib/auth-store"

export type AuthSource = "google" | "local"

export interface CurrentUser extends User {
  source: AuthSource
  image?: string | null
}

/**
 * Single view of "who is signed in", across both login methods.
 *
 * Two systems coexist deliberately: Google users are authenticated server-side
 * by Auth.js (httpOnly cookie), while the older email/password accounts still
 * live in localStorage. Components should not care which — they read from here.
 *
 * A Google session wins when both are present, because it is the one that was
 * actually verified.
 */
export function useCurrentUser(): {
  user: CurrentUser | null
  isLoading: boolean
  source: AuthSource | null
} {
  const { data: session, status } = useSession()
  const localUser = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  const linkedProfile = useAuthStore((s) => s.linkedProfile)

  const isLoading = status === "loading" || !hasHydrated

  if (session?.user?.email) {
    /*
     * Account linking: if an email/password account already exists with this
     * address, reuse its id so the person keeps their appointment history
     * instead of landing in an empty profile.
     */
    const linked = linkedProfile(session.user.email)

    return {
      isLoading,
      source: "google",
      user: {
        id: linked?.id ?? session.user.id,
        /*
         * Google only supplies a display name, so the parts stay empty until
         * the visitor fills them in. FIN in particular cannot be inferred, and
         * the results lookup needs it — /profil prompts for what is missing.
         */
        firstName: linked?.firstName ?? "",
        lastName: linked?.lastName ?? "",
        fatherName: linked?.fatherName ?? "",
        gender: linked?.gender ?? "FEMALE",
        fullName: linked?.fullName || session.user.name || session.user.email,
        email: session.user.email,
        phone: linked?.phone ?? "",
        finCode: linked?.finCode ?? "",
        createdAt: linked?.createdAt ?? new Date(0).toISOString(),
        image: session.user.image,
        source: "google",
      },
    }
  }

  if (localUser) {
    return { user: { ...localUser, source: "local" }, isLoading, source: "local" }
  }

  return { user: null, isLoading, source: null }
}
