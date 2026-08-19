"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useBasketStore } from "@/lib/basket-store"
import { cn } from "@/lib/utils"

/** Basket entry point with a live count. Hidden until it holds something. */
export default function BasketLink({ overHero }: { overHero?: boolean }) {
  const lines = useBasketStore((s) => s.lines)
  const hasHydrated = useBasketStore((s) => s.hasHydrated)

  if (!hasHydrated || lines.length === 0) return null

  return (
    <Link
      href="/sebet"
      aria-label={`Səbətim — ${lines.length} xidmət`}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        overHero ? "text-white hover:bg-white/10" : "text-slate-700 hover:bg-teal-50"
      )}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-white">
        {lines.length}
      </span>
    </Link>
  )
}
