"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, ListPlus, ShoppingCart, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { basketSubtotal, useBasketStore,
  lineName,
  linePatientId,
} from "@/lib/basket-store"
import { shortServiceName } from "@/lib/service-name"
import { cn } from "@/lib/utils"
import { useT } from "@/i18n/client"

const formatAzn = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(2)} AZN`

/**
 * The basket, as a button pinned to the right of the screen with the list in a
 * popup behind it.
 *
 * It used to live in the header, which meant it scrolled away exactly when it
 * mattered — halfway down a catalogue of a thousand tests, with no way to see
 * what was already selected without going back up.
 *
 * Hidden while empty: a permanent empty basket floating over every page is
 * clutter, and there is nothing to look at inside it.
 */
export default function FloatingBasket() {
  const t = useT()
  const lines = useBasketStore((s) => s.lines)
  const hasHydrated = useBasketStore((s) => s.hasHydrated)
  const remove = useBasketStore((s) => s.remove)
  const clear = useBasketStore((s) => s.clear)
  const pathname = usePathname()

  /*
   * The panel remembers which page it was opened on, so navigating away closes
   * it by simply no longer matching. It is fixed to the viewport, so left open
   * it would hang over a page the visitor has already moved on to — and this
   * derives that from the route rather than firing an effect to undo state.
   */
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  const open = openedOn === pathname
  const setOpen = (next: boolean) => setOpenedOn(next ? pathname : null)
  /*
   * The homepage hero is the same teal as the button, so over it the button
   * disappeared into the photograph. Inverted while it is there, and switched
   * on the same 90px threshold and 700ms easing as the header, so the two
   * change together rather than one lagging the other.
   */
  const [overHero, setOverHero] = useState(pathname === "/")

  useEffect(() => {
    const onScroll = () => setOverHero(pathname === "/" && window.scrollY < 90)

    /*
     * The first reading is deferred a tick rather than taken inline: a reload
     * partway down the page restores the scroll position, so the state has to
     * be corrected once — but doing it synchronously in the effect body is the
     * cascading-render pattern React warns about. A timer, not rAF, which is
     * paused while the document is hidden.
     */
    const timer = setTimeout(onScroll)
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", onScroll)
    }
  }, [pathname])

  const [pulse, setPulse] = useState(false)
  const previous = useRef(lines.length)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (lines.length > previous.current) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 420)
      previous.current = lines.length
      return () => clearTimeout(timer)
    }
    previous.current = lines.length
  }, [lines.length])

  useEffect(() => {
    if (!open) return

    const close = () => setOpenedOn(null)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    const onClick = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) close()
    }

    document.addEventListener("keydown", onKey)
    // Deferred to the next tick, or the click that opened the panel closes it.
    const timer = setTimeout(() => document.addEventListener("click", onClick))

    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("click", onClick)
      clearTimeout(timer)
    }
  }, [open])

  // The basket page has the whole basket on it already.
  if (!hasHydrated || lines.length === 0 || pathname === "/sebet") return null

  const total = basketSubtotal(lines)

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed bottom-5 right-4 z-50 md:bottom-8 md:right-6",
        // The catalogue shows a basket column from xl up; two baskets on one
        // screen is one too many.
        pathname === "/xidmetler" && "xl:hidden"
      )}
    >
      {open && (
        <div
          role="dialog"
          aria-label={t.basket.title}
          className="panel-in absolute bottom-16 right-0 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
            <h2 className="font-display text-[var(--ink)]">{t.basket.title}</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clear}
                className="text-xs text-[var(--ink-muted)] underline-offset-4 hover:text-red-600 hover:underline"
              >
                {t.basket.clear}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.common.close}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--secondary)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <ul className="max-h-[min(22rem,50vh)] divide-y divide-[var(--line)] overflow-y-auto">
            {lines.map((line) => (
              <li key={line.slug} className="line-in flex items-start gap-2 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span
                    title={lineName(line, t.locale)}
                    className="block text-sm leading-snug text-[var(--ink)]"
                  >
                    {shortServiceName(lineName(line, t.locale))}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">
                    {formatAzn(
                      line.promoted != null && line.promoted < line.price
                        ? line.promoted
                        : line.price
                    )}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => remove(line.slug, linePatientId(line))}
                  aria-label={t.f(t.basket.removeFrom, { name: lineName(line, t.locale) })}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--ink-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-[var(--line)] px-4 py-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[var(--ink-muted)]">
                {t.n(t.common.serviceCount, lines.length)}
              </span>
              <span className="font-display text-step-1 text-primary">
                {formatAzn(total)}
              </span>
            </div>
            <Button variant="cta" className="mt-3 w-full" asChild>
              <Link href="/sebet">
                {t.basket.goToBasket}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            {/*
              The way back to the catalogue. Opened from a doctor page or the
              homepage, the panel was a dead end: every route out of it led to
              checkout, so adding a second test meant finding the menu again.
            */}
            <Button variant="outline" className="mt-2 w-full" asChild>
              <Link href="/xidmetler#laboratory-catalog">
                <ListPlus className="h-4 w-4" aria-hidden="true" />
                {t.basket.addService}
              </Link>
            </Button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${t.basket.title} — ${t.n(t.common.serviceCount, lines.length)}, ${formatAzn(total)}`}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-[background-color,color,transform] duration-700 ease-out hover:scale-105 active:scale-95",
          overHero
            ? "bg-white text-primary ring-1 ring-black/5"
            : "bg-primary text-white"
        )}
      >
        <ShoppingCart className="h-6 w-6" aria-hidden="true" />
        <span
          className={cn(
            "absolute -right-0.5 -top-0.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold transition-colors duration-700 ease-out",
            overHero ? "bg-primary text-white" : "bg-[var(--ink)] text-white",
            pulse && "badge-pop"
          )}
        >
          {lines.length}
        </span>
      </button>
    </div>
  )
}
