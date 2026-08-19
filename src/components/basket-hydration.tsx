"use client"

import { useEffect } from "react"
import { useBasketStore } from "@/lib/basket-store"

/** Rehydrates the persisted basket after mount — see StoreHydration. */
export default function BasketHydration() {
  useEffect(() => {
    useBasketStore.persist.rehydrate()
  }, [])
  return null
}
