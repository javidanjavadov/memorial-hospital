"use client"

import { Check, Plus } from "lucide-react"
import { useBasketStore, type BasketLine } from "@/lib/basket-store"
import { cn } from "@/lib/utils"

/**
 * Adds one test to the basket.
 *
 * Renders the "not added" state until the persisted basket has loaded, so the
 * server markup and the first client render agree — the same reason the navbar
 * shows "Daxil Ol" by default.
 */
export default function AddToBasketButton({
  line,
  className,
}: {
  line: BasketLine
  className?: string
}) {
  const lines = useBasketStore((s) => s.lines)
  const hasHydrated = useBasketStore((s) => s.hasHydrated)
  const add = useBasketStore((s) => s.add)
  const remove = useBasketStore((s) => s.remove)

  const added = hasHydrated && lines.some((l) => l.slug === line.slug)

  return (
    <button
      type="button"
      onClick={() => (added ? remove(line.slug) : add(line))}
      aria-pressed={added}
      aria-label={
        added ? `${line.name} səbətdən çıxar` : `${line.name} səbətə əlavə et`
      }
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1 text-[0.7rem] font-medium transition-colors",
        added
          ? "border-primary bg-primary text-white"
          : "border-[var(--line)] text-[var(--ink-muted)] hover:border-primary/50 hover:text-primary",
        className
      )}
    >
      {added ? (
        <>
          <Check className="h-3 w-3" aria-hidden="true" />
          Səbətdə
        </>
      ) : (
        <>
          <Plus className="h-3 w-3" aria-hidden="true" />
          Səbətə
        </>
      )}
    </button>
  )
}
