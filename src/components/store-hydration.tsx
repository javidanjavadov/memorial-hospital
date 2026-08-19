"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"

/**
 * Rehydrates the persisted auth store after mount.
 *
 * The store is created with `skipHydration: true` so that the first client
 * render matches the server-rendered markup (always logged out). Reading
 * localStorage here, one tick later, avoids the hydration mismatch that
 * `suppressHydrationWarning` was previously papering over.
 */
export default function StoreHydration() {
  useEffect(() => {
    useAuthStore.persist.rehydrate()
  }, [])

  return null
}
