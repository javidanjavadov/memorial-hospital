"use client"

import { useEffect } from "react"
import { useFamilyStore } from "@/lib/family-store"

/** Rehydrates the persisted family list after mount — see StoreHydration. */
export default function FamilyHydration() {
  useEffect(() => {
    useFamilyStore.persist.rehydrate()
  }, [])
  return null
}
