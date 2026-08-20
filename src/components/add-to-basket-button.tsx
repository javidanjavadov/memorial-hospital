"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Plus } from "lucide-react"
import { useBasketStore, type BasketLine } from "@/lib/basket-store"
import { cn } from "@/lib/utils"
import { useT } from "@/i18n/client"

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
  variant = "label",
}: {
  line: BasketLine
  className?: string
  /** "icon" is the round +, matching the hospital's own service cards. */
  variant?: "label" | "icon"
}) {
  const lines = useBasketStore((s) => s.lines)
  const t = useT()
  const hasHydrated = useBasketStore((s) => s.hasHydrated)
  const add = useBasketStore((s) => s.add)
  const remove = useBasketStore((s) => s.remove)

  const added = hasHydrated && lines.some((l) => l.slug === line.slug)

  /*
   * Adding is the one action here with no page change behind it. Without a
   * visible response the button reads as dead, and people click it again —
   * which, since the same button removes, takes the test straight back out.
   */
  const [popping, setPopping] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const pop = () => {
    if (timer.current) clearTimeout(timer.current)
    setPopping(true)
    timer.current = setTimeout(() => setPopping(false), 320)
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (added) {
          remove(line.slug)
        } else {
          add(line)
          pop()
        }
      }}
      aria-pressed={added}
      aria-label={t.f(added ? t.basket.removeFrom : t.basket.addTo, {
        name: line.name,
      })}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1 border font-medium transition-colors duration-200 active:scale-95",
        variant === "icon"
          ? "h-8 w-8 rounded-lg"
          : "rounded-lg px-2 py-1 text-[0.7rem]",
        popping && "basket-pop",
        added
          ? "border-primary bg-primary text-white"
          : "border-[var(--line)] text-[var(--ink-muted)] hover:border-primary hover:text-primary",
        className
      )}
    >
      {variant === "icon" ? (
        added ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Plus className="h-4 w-4" aria-hidden="true" />
        )
      ) : added ? (
        <>
          <Check className="h-3 w-3" aria-hidden="true" />
          {t.basket.inBasket}
        </>
      ) : (
        <>
          <Plus className="h-3 w-3" aria-hidden="true" />
          {t.basket.addToBasket}
        </>
      )}
    </button>
  )
}
