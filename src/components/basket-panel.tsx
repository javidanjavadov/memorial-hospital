"use client"

import Link from "next/link"
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  basketSubtotal,
  HOME_COLLECTION_FEE,
  useBasketStore,
} from "@/lib/basket-store"
import { shortServiceName } from "@/lib/service-name"

const formatAzn = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(2)} AZN`

/**
 * Basket kept in view beside the catalogue, so what you have selected stays
 * visible while you keep adding — the arrangement the hospital's own order-entry
 * panel uses.
 *
 * Sticky rather than fixed: it scrolls with the page until it reaches the top,
 * then holds, which keeps it clear of the header and lets the footer past.
 */
export default function BasketPanel() {
  const lines = useBasketStore((s) => s.lines)
  const homeCollection = useBasketStore((s) => s.homeCollection)
  const hasHydrated = useBasketStore((s) => s.hasHydrated)
  const remove = useBasketStore((s) => s.remove)
  const clear = useBasketStore((s) => s.clear)

  const subtotal = basketSubtotal(lines)
  const total = subtotal + (homeCollection ? HOME_COLLECTION_FEE : 0)

  return (
    /*
     * Sized to what it holds, not to the screen: a full-height panel was mostly
     * empty border for a basket of two lines. Sticky, so it follows down the
     * catalogue, and bounded by its column, so it stops rather than trailing
     * past the end of the list.
     */
    <div className="sticky top-24 flex max-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--paper-raised)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <h2 className="font-display text-[var(--ink)]">Səbətim</h2>
        {hasHydrated && lines.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-[var(--ink-muted)] underline-offset-4 hover:text-red-600 hover:underline"
          >
            Təmizlə
          </button>
        )}
      </div>

      {!hasHydrated || lines.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <span
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--secondary)]"
            aria-hidden="true"
          >
            <ShoppingCart className="h-6 w-6 text-[var(--ink-muted)]" />
          </span>
          <p className="text-sm font-medium text-[var(--ink)]">
            Səbətiniz boşdur
          </p>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            Başlamaq üçün soldakı siyahıdan xidmət əlavə edin.
          </p>
        </div>
      ) : (
        <>
          {/*
            Capped and scrollable: a basket of thirty tests would otherwise run
            past the viewport and push the total out of reach.
          */}
          <ul className="max-h-[22rem] divide-y divide-[var(--line)] overflow-y-auto">
            {lines.map((line) => {
              const effective =
                line.promoted != null && line.promoted < line.price
                  ? line.promoted
                  : line.price
              return (
                <li
                  key={line.slug}
                  className="line-in flex items-start gap-2 px-4 py-3"
                >
                  <span className="min-w-0 flex-1">
                    <span
                      title={line.name}
                      className="block text-sm leading-snug text-[var(--ink)]"
                    >
                      {shortServiceName(line.name)}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">
                      {formatAzn(effective)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(line.slug)}
                    aria-label={`${line.name} səbətdən çıxar`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--ink-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="shrink-0 border-t border-[var(--line)] px-4 py-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[var(--ink-muted)]">
                {lines.length} xidmət
              </span>
              <span className="font-display text-step-1 text-primary">
                {formatAzn(total)}
              </span>
            </div>
            <Button variant="cta" className="mt-3 w-full" asChild>
              <Link href="/sebet">
                Səbətə keç
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
