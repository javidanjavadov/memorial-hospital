"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

/**
 * Auth.js's provider is a Client Component, so it needs this wrapper to be
 * mounted from the server root layout.
 */
export default function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
