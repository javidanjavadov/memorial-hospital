"use client"

import { useSession } from "next-auth/react"

export interface CurrentUser {
  id: string
  firstName: string
  lastName: string
  fatherName: string
  gender: "MALE" | "FEMALE"
  fullName: string
  email: string
  phone: string
  finCode: string
  birthDate: string
  image?: string | null
  /** Retained so existing call sites keep compiling; always "google" now. */
  source: "google"
}

/**
 * Who is signed in, according to the server.
 *
 * Everything here comes from the Auth.js session — a JWT signed with
 * AUTH_SECRET and delivered as an httpOnly cookie. Nothing is read from
 * localStorage any more.
 *
 * That change is the point. The old email/password path verified the password
 * in the browser against a hash in localStorage, so editing one object in
 * devtools made you any patient in that browser — and once the profile held a
 * FIN, a date of birth and a list of ordered tests, that stopped being an
 * acceptable shortcut.
 *
 * `user` is non-null only when the profile has been completed through
 * /api/profile; middleware holds an incomplete session on /profil.
 */
export function useCurrentUser(): {
  user: CurrentUser | null
  isLoading: boolean
  source: "google" | null
} {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  const account = session?.user
  if (!account?.email) return { user: null, isLoading, source: null }

  const profile = account.profile

  return {
    isLoading,
    source: "google",
    user: {
      id: account.id,
      email: account.email,
      image: account.image,
      source: "google",
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      fatherName: profile?.fatherName ?? "",
      gender: profile?.gender ?? "MALE",
      // Falls back to Google's display name so the header has something to show
      // while the details are still being filled in.
      fullName: profile?.fullName || account.name || account.email,
      phone: profile?.phone ?? "",
      finCode: profile?.finCode ?? "",
      birthDate: profile?.birthDate ?? "",
    },
  }
}
