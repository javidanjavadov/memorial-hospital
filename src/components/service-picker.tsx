"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  History,
  ListPlus,
  Loader2,
  RotateCcw,
  Search,
  Star,
  Stethoscope,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import ServiceInfoButton from "@/components/service-info-button"
import BasketPanel from "@/components/basket-panel"
import PatientHeader from "@/components/patient-header"
import AddToBasketButton from "@/components/add-to-basket-button"
import { branches } from "@/data"
import { ordersFor, useBasketStore, type BasketLine } from "@/lib/basket-store"
import { shortServiceName } from "@/lib/service-name"
import { useCurrentUser } from "@/lib/use-current-user"
import { cn } from "@/lib/utils"

const DEFAULT_BRANCH = "nrimanov"

export interface PickerCategory {
  slug: string
  name: string
  count: number
  from: number
  /** The leading "Populyar" chip, which repeats items from real categories. */
  featured?: boolean
}

export interface PickerGroup {
  slug: string
  name: string
  blurb: string
  count: number
  categories: PickerCategory[]
}

interface PickerItem {
  slug: string
  name: string
  code: string
  description: string
  prep: string
  categoryName: string
  prices: Record<string, { price: number; promoted: number | null }>
}

const GROUP_ICONS: Record<string, typeof FlaskConical> = {
  "laboratory-catalog": FlaskConical,
  "polyclinic-catalog": Stethoscope,
  "doctor-appointment": UserRound,
}

const formatAzn = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(2)} AZN`

const formatDate = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

const priceOf = (item: PickerItem) =>
  item.prices[DEFAULT_BRANCH]?.price ?? Object.values(item.prices)[0]?.price ?? 0

const promotedOf = (item: PickerItem) =>
  item.prices[DEFAULT_BRANCH]?.promoted ?? null

/**
 * Order entry for the whole catalogue on one page: group, then category, then
 * the services themselves, with the basket beside them — the shape of the
 * hospital's own panel, so a patient and the person at the desk are looking at
 * the same thing.
 *
 * Categories are fetched one at a time from public/catalog/*.json. The full
 * catalogue is 536KB; the alternative to fetching is shipping all of it to
 * render one category of eleven items.
 */
export default function ServicePicker({ groups }: { groups: PickerGroup[] }) {
  const [tab, setTab] = useState<"services" | "orders">("services")
  const [groupSlug, setGroupSlug] = useState(groups[0]?.slug ?? "")
  const [categorySlug, setCategorySlug] = useState(
    groups[0]?.categories[0]?.slug ?? ""
  )
  const [items, setItems] = useState<PickerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState("")

  /*
   * A group can be linked to directly — /xidmetler#polyclinic-catalog.
   *
   * It has to be an effect, and it has to set state: the fragment is never
   * sent to the server, so reading it in the initialiser would render one
   * group on the server and another on the client, and hydration would
   * mismatch. Read once on mount rather than watched — after that the visitor
   * is driving, and a stale hash should not yank them back.
   */
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const target = groups.find((entry) => entry.slug === hash)
    if (!target) return
    setGroupSlug(target.slug)
    setCategorySlug(target.categories[0]?.slug ?? "")
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const cache = useRef(new Map<string, PickerItem[]>())
  const chipsRef = useRef<HTMLDivElement>(null)

  const group = groups.find((g) => g.slug === groupSlug) ?? groups[0]
  const category = group?.categories.find((c) => c.slug === categorySlug)

  useEffect(() => {
    if (!categorySlug) return

    const cached = cache.current.get(categorySlug)
    if (cached) {
      setItems(cached)
      setLoading(false)
      setFailed(false)
      return
    }

    // Aborted on change: switching categories quickly must not let an earlier,
    // slower response land after a later one and show the wrong list.
    const controller = new AbortController()
    setLoading(true)
    setFailed(false)

    fetch(`/catalog/${categorySlug}.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status))
        return response.json()
      })
      .then((data: PickerItem[]) => {
        cache.current.set(categorySlug, data)
        setItems(data)
        setLoading(false)
      })
      .catch((error) => {
        if (error?.name === "AbortError") return
        setFailed(true)
        setLoading(false)
      })

    return () => controller.abort()
  }, [categorySlug])

  const selectGroup = useCallback(
    (slug: string) => {
      setGroupSlug(slug)
      setQuery("")
      const first = groups.find((g) => g.slug === slug)?.categories[0]
      if (first) setCategorySlug(first.slug)
      chipsRef.current?.scrollTo({ left: 0 })
    },
    [groups]
  )

  const needle = query.trim().toLowerCase()
  const visible = needle
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(needle) ||
          item.code.toLowerCase().includes(needle)
      )
    : items

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="min-w-0">
        <PatientHeader className="mb-6" />

        <div
          role="tablist"
          aria-label="Kataloq görünüşü"
          className="mb-6 flex gap-6 border-b border-[var(--line)]"
        >
          {(
            [
              { id: "services", label: "Xidmət seçimi", icon: ListPlus },
              { id: "orders", label: "Keçmiş sifarişlər", icon: History },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "-mb-px inline-flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                tab === item.id
                  ? "border-primary text-primary"
                  : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>

        {tab === "services" ? (
          <div key="services" className="panel-in">
            {/* Groups */}
            <div className="grid gap-3 sm:grid-cols-3">
              {groups.map((entry) => {
                const Icon = GROUP_ICONS[entry.slug] ?? FlaskConical
                const active = entry.slug === group?.slug
                return (
                  <button
                    key={entry.slug}
                    type="button"
                    aria-pressed={active}
                    onClick={() => selectGroup(entry.slug)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.98]",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-[var(--line)] bg-[var(--paper-raised)] hover:border-primary/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        active
                          ? "bg-primary text-white"
                          : "bg-[var(--secondary)] text-[var(--ink-muted)]"
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[var(--ink)]">
                        {entry.name}
                      </span>
                      <span className="block text-xs text-[var(--ink-muted)]">
                        {/* The Populyar chip is not a category of its own —
                            counting it would claim one more than the strip
                            actually offers. */}
                        {entry.categories.filter((c) => !c.featured).length}{" "}
                        kateqoriya · {entry.count} xidmət
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <CategoryStrip
              ref={chipsRef}
              categories={group?.categories ?? []}
              selected={categorySlug}
              onSelect={(slug) => {
                setCategorySlug(slug)
                setQuery("")
              }}
            />

            <label className="relative mt-4 block">
              <span className="sr-only">Xidmət axtar</span>
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`${category?.name ?? "Kataloq"} içində axtar`}
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper-raised)] py-2.5 pl-9 pr-3 text-sm text-[var(--ink)] outline-none focus:border-primary"
              />
            </label>

            <div className="mt-5">
              {loading ? (
                <div
                  className="flex items-center justify-center gap-3 py-16"
                  role="status"
                >
                  <Loader2
                    className="h-5 w-5 animate-spin text-primary"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-[var(--ink-muted)]">
                    Xidmətlər yüklənir...
                  </span>
                </div>
              ) : failed ? (
                /* The category page is statically rendered and needs no fetch,
                   so it still works when this one does not. */
                <div className="rounded-xl border border-[var(--line)] p-8 text-center">
                  <p className="text-sm text-[var(--ink)]">
                    Xidmətlər yüklənmədi.
                  </p>
                  {!category?.featured && (
                    <Button variant="outline" className="mt-3" asChild>
                      <Link href={`/xidmetler/${categorySlug}`}>
                        Kateqoriya səhifəsini aç
                      </Link>
                    </Button>
                  )}
                </div>
              ) : visible.length === 0 ? (
                <p className="py-12 text-center text-sm text-[var(--ink-muted)]">
                  “{query}” üzrə nəticə tapılmadı.
                </p>
              ) : (
                <>
                  <p className="mb-3 text-xs text-[var(--ink-muted)]">
                    {visible.length} xidmət · qiymətlər{" "}
                    {branches.find((b) => b.id === DEFAULT_BRANCH)?.name} üzrə
                  </p>
                  {/*
                    Keyed on the category so the cards replay their entrance
                    when it changes — without it React reuses the list and the
                    switch happens with no visible response at all.
                  */}
                  <ul
                    key={categorySlug}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {visible.map((item, index) => (
                      <ServiceCard key={item.slug} item={item} index={index} />
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        ) : (
          <div key="orders" className="panel-in">
            <PastOrders onReorder={() => setTab("services")} />
          </div>
        )}
      </div>

      {/*
        The basket kept in view beside the catalogue, as the hospital's panel
        has it. Wide screens only — below xl there is no room for a column, and
        the pinned button covers it there.
      */}
      <aside className="hidden xl:block">
        <BasketPanel />
      </aside>
    </div>
  )
}

/**
 * Horizontally scrolling category strip.
 *
 * Laboratoriya alone has 51 categories: stacked as a wrapped list they push the
 * services themselves off the screen, which is the thing people came for. The
 * arrows appear only where there is no touch scrolling to reach for.
 */
function CategoryStrip({
  ref,
  categories,
  selected,
  onSelect,
}: {
  ref: React.RefObject<HTMLDivElement | null>
  categories: PickerCategory[]
  selected: string
  onSelect: (slug: string) => void
}) {
  const scrollBy = (direction: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.8), behavior: "smooth" })
  }

  return (
    <div className="relative mt-4">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Geri sürüşdür"
        className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-white shadow-sm transition-colors hover:border-primary hover:text-primary md:flex"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {/*
        The clearance for the arrows is a wrapper, not padding on the scroller:
        a flex scroll container does not reliably honour its own start padding
        once the content overflows, and the first chip ended up underneath the
        left arrow.
      */}
      <div className="md:px-12">
      <div
        ref={ref}
        /*
          `safe center`: centred while the chips fit, and left-aligned once they
          overflow. Plain `center` would push the first chips out of reach —
          overflow spills off both ends and the left one cannot be scrolled to.

          The horizontal padding is the gap for the arrows, which sit over the
          ends of the strip; without it the first and last chip run underneath
          them.
        */
        className="scrollbar-none flex snap-x gap-2 overflow-x-auto scroll-smooth pb-1 [justify-content:safe_center]"
      >
        {categories.map((category) => {
          const active = category.slug === selected
          return (
            <button
              key={category.slug}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(category.slug)}
              className={cn(
                "snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-all duration-200 active:scale-95",
                active
                  ? "border-primary bg-primary text-white"
                  : "border-[var(--line)] bg-[var(--paper-raised)] text-[var(--ink-muted)] hover:border-primary/40 hover:text-[var(--ink)]"
              )}
            >
              {category.featured && (
                <Star
                  className={cn(
                    "mr-1.5 inline h-3.5 w-3.5 align-[-2px]",
                    active ? "text-white" : "text-primary"
                  )}
                  aria-hidden="true"
                />
              )}
              {category.name}
              <span className={cn("ml-1.5 text-xs", active ? "text-white/75" : "opacity-60")}>
                {category.count}
              </span>
            </button>
          )
        })}
      </div>
      </div>

      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="İrəli sürüşdür"
        className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-white shadow-sm transition-colors hover:border-primary hover:text-primary md:flex"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function ServiceCard({ item, index }: { item: PickerItem; index: number }) {
  const price = priceOf(item)
  const promoted = promotedOf(item)
  const discounted = promoted !== null && promoted < price

  const line: BasketLine = {
    slug: item.slug,
    name: item.name,
    code: item.code,
    price,
    promoted,
  }

  return (
    <li
      /* Capped: a 224-item category would otherwise spend five seconds
         arriving. Past the cap they land together, which is what a full
         screen looks like anyway. */
      style={{ "--card-index": Math.min(index, 24) } as React.CSSProperties}
      className="card-in flex h-full flex-col rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-3.5 transition-shadow duration-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          title={item.name}
          className="line-clamp-2 text-[0.8rem] font-medium leading-snug text-[var(--ink)]"
        >
          {shortServiceName(item.name)}
        </h3>
        <ServiceInfoButton service={item} />
      </div>

      {/*
        Where the hospital's panel prints "Sample: Sidik". The catalogue has no
        sample-type field, so this shows the turnaround instead rather than an
        empty label — see the note in README about pulling `materials`.
      */}
      <p className="mt-2 text-[0.7rem] leading-tight text-[var(--ink-muted)]">
        {item.prep ? `Hazır: ${item.prep}` : item.categoryName}
      </p>

      <div className="flex-1" />

      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="flex flex-col">
          {discounted && (
            <span className="text-[0.65rem] leading-none text-[var(--ink-muted)] line-through">
              {formatAzn(price)}
            </span>
          )}
          <span className="font-display text-[0.95rem] text-[var(--ink)]">
            {formatAzn(discounted ? (promoted as number) : price)}
          </span>
        </span>
        <AddToBasketButton line={line} variant="icon" />
      </div>
    </li>
  )
}

function PastOrders({ onReorder }: { onReorder: () => void }) {
  const allOrders = useBasketStore((s) => s.orders)
  const hasHydrated = useBasketStore((s) => s.hasHydrated)
  const reorder = useBasketStore((s) => s.reorder)
  const { user } = useCurrentUser()

  const orders = hasHydrated ? ordersFor(allOrders, user?.id) : []

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-10 text-center">
        <History
          className="mx-auto mb-3 h-10 w-10 text-[var(--ink-muted)]"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-[var(--ink)]">
          Hələ sifarişiniz yoxdur
        </p>
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          Göndərdiyiniz sifarişlər burada saxlanılır.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <li
          key={order.id}
          className="rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">
                {formatDate(order.createdAt)}
              </p>
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                {branches.find((b) => b.id === order.branch)?.name ?? order.branch} ·{" "}
                {order.lines.length} xidmət
                {order.homeCollection && " · evdə qanalma"}
                {order.paymentMethod === "CARD" ? " · kart" : " · nağd"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display text-[var(--ink)]">
                {formatAzn(order.total)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  reorder(order.id)
                  onReorder()
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Təkrarla
              </Button>
            </div>
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--line)] pt-3">
            {order.lines.map((line) => (
              <li
                key={line.slug}
                className="rounded-md bg-[var(--secondary)] px-2 py-1 text-xs text-[var(--ink)]"
              >
                {shortServiceName(line.name)}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
