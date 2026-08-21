"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
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
import { relationLabel } from "@/components/patient-select"
import PatientPrompt from "@/components/patient-prompt"
import PickerTour from "@/components/picker-tour"
import { findPatient, shouldAskForPatient, usePatients } from "@/lib/patients"
import AddToBasketButton from "@/components/add-to-basket-button"
import { branches } from "@/data"
import { ordersFor, useBasketStore, type BasketLine,
  lineName,
} from "@/lib/basket-store"
import { shortServiceName } from "@/lib/service-name"
import { useCurrentUser } from "@/lib/use-current-user"
import { useT } from "@/i18n/client"
import { cn } from "@/lib/utils"

const DEFAULT_BRANCH = "nrimanov"

/** Set once the tour has been finished or skipped. */
const TOUR_SEEN_KEY = "memorial-picker-tour"

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
  names?: Record<string, string>
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
  const t = useT()
  const [tab, setTab] = useState<"services" | "orders">("services")
  const [groupSlug, setGroupSlug] = useState(groups[0]?.slug ?? "")
  const [categorySlug, setCategorySlug] = useState(
    groups[0]?.categories[0]?.slug ?? ""
  )
  const { patients, isSingle, isLoading: patientsLoading } = usePatients()
  const activePatientId = useBasketStore((s) => s.activePatientId)
  const setActivePatient = useBasketStore((s) => s.setActivePatient)
  const { user } = useCurrentUser()
  const activePatient = findPatient(patients, activePatientId)

  const [items, setItems] = useState<PickerItem[]>([])
  /* Which category the rendered list belongs to. The list is keyed on this, not
     on the selected category, so the outgoing cards stay put and fade while the
     next set loads instead of remounting mid-transition. */
  const [loadedSlug, setLoadedSlug] = useState("")
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

    const cacheKey = `${t.locale}:${categorySlug}`
    const cached = cache.current.get(cacheKey)
    if (cached) {
      setItems(cached)
      setLoadedSlug(categorySlug)
      setLoading(false)
      setFailed(false)
      return
    }

    // Aborted on change: switching categories quickly must not let an earlier,
    // slower response land after a later one and show the wrong list.
    const controller = new AbortController()
    setLoading(true)
    setFailed(false)

    fetch(`/catalog/${t.locale}/${categorySlug}.json`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status))
        return response.json()
      })
      .then((data: PickerItem[]) => {
        cache.current.set(cacheKey, data)
        setItems(data)
        setLoadedSlug(categorySlug)
        setLoading(false)
      })
      .catch((error) => {
        if (error?.name === "AbortError") return
        setFailed(true)
        setLoading(false)
      })

    return () => controller.abort()
    // t.locale is a dependency: switching language must refetch, not reuse the
    // list already on screen.
  }, [categorySlug, t.locale])

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

  /*
   * Settles step 1 once the session and the family list have both loaded.
   *
   * A signed-out visitor gets no patient at all — their lines carry none, which
   * is what `linePatientId` reads as "the account holder" if they sign in
   * later. A lone account holder is selected for them. Anyone with relatives is
   * left on step 1 to choose.
   */
  useEffect(() => {
    if (patientsLoading) return

    if (!user) {
      if (activePatientId) setActivePatient("", "")
      return
    }

    if (isSingle) {
      const self = patients[0]
      if (self && activePatientId !== self.id) {
        setActivePatient(self.id, self.fullName)
      }
      return
    }

    /* Has relatives: a patient chosen on a previous visit still counts, but one
       who has since been removed from the family must not. */
    if (activePatientId && !patients.some((p) => p.id === activePatientId)) {
      setActivePatient("", "")
    }
  }, [
    patientsLoading,
    user,
    isSingle,
    patients,
    activePatientId,
    setActivePatient,
  ])

  /*
   * Answered on THIS visit — chosen or dismissed. Deliberately component state
   * and never persisted: the question is asked afresh every time the catalogue
   * is opened, and this only stops it reappearing while the visitor is still on
   * the page.
   */
  const [answered, setAnswered] = useState(false)
  const promptOpen = shouldAskForPatient({
    isLoading: patientsLoading,
    isSignedIn: !!user,
    patientCount: patients.length,
    answered,
  })

  /*
   * The guided tour, shown once per browser.
   *
   * Starts when the patient dialog closes rather than on arrival: two things
   * competing for attention teaches neither, and the dialog is the one with a
   * question in it. `tourDone` is persisted because this is genuinely
   * one-time — unlike the patient question, which is asked every visit.
   */
  const [tourOpen, setTourOpen] = useState(false)

  const startTour = () => {
    if (typeof window === "undefined") return
    try {
      if (window.localStorage.getItem(TOUR_SEEN_KEY)) return
    } catch {
      // Private mode: no memory of the tour, so it is simply not shown.
      return
    }
    setTourOpen(true)
  }

  const finishTour = useCallback(() => {
    setTourOpen(false)
    try {
      window.localStorage.setItem(TOUR_SEEN_KEY, "1")
    } catch {
      /* Nothing to do — it will be offered again next time. */
    }
  }, [])

  const choosePatient = useCallback(
    (id: string) => {
      const next = findPatient(patients, id)
      if (!next) return
      setActivePatient(next.id, next.fullName)
    },
    [patients, setActivePatient]
  )

  /* Plain function, not useCallback: the React Compiler memoises this component
     for us, and a hand-written dependency list it cannot verify makes it skip
     optimising the whole file. */
  const chooseFromPrompt = (id: string) => {
    choosePatient(id)
    setAnswered(true)
    startTour()
  }

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
          aria-label={t.catalog.categoryView}
          className="mb-6 flex gap-6 border-b border-[var(--line)]"
        >
          {(
            [
              { id: "services", label: t.catalog.serviceSelection, icon: ListPlus },
              { id: "orders", label: t.catalog.pastOrders, icon: History },
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
            {/*
              One screen, not a wizard.

              Choosing a category is not a commitment — people cross between
              them constantly while building a request — so putting a Continue
              button between the categories and the services made the ordinary
              case worse to serve a step nobody asked for. The category strip
              sits directly above the list it filters, which is what the
              hospital's own panel does.

              The patient is a selector rather than a step for the same reason:
              it is a setting on the order, not a stage of it.
            */}
            {/*
              Who the order is for.

              Shaped like a select — avatar, name, relation, chevron — but built
              rather than native. A real <select> could not show an avatar or put
              the relation on its own line, and its dropdown is drawn by the OS,
              so the list of relatives lost the dates of birth and FIN codes that
              tell two people with one surname apart. This opens the same dialog
              used on arrival instead, so there is one way to pick a patient.

              The callout underneath is the part that teaches. When the dialog
              closes, the choice the visitor just made moves from the middle of
              the screen to a control at the top they were never looking at —
              so a pointer follows it there and says what it is. It shows only
              in that moment; a permanent caption on a control this plain would
              be clutter.
            */}
            {user && activePatient && patients.length > 1 && (
              <div className="relative mb-8">
                <p
                  id="picker-patient-label"
                  className="mb-2 text-sm font-medium text-[var(--ink)]"
                >
                  {t.family.forWhom}
                </p>

                <button
                  id="tour-patient"
                  type="button"
                  onClick={() => setAnswered(false)}
                  aria-haspopup="dialog"
                  aria-labelledby="picker-patient-label picker-patient-name"
                  className="flex w-full max-w-md items-center gap-4 rounded-xl border-2 border-[var(--line)] bg-[var(--paper-raised)] p-4 text-left transition-colors duration-300 hover:border-primary"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                    aria-hidden="true"
                  >
                    {activePatient.fullName
                      .split(" ")
                      .filter(Boolean)
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      id="picker-patient-name"
                      className="block truncate font-display text-step-0 text-[var(--ink)]"
                    >
                      {activePatient.fullName}
                    </span>
                    <span className="block text-sm text-[var(--ink-muted)]">
                      {relationLabel(activePatient, t)}
                    </span>
                  </span>

                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)] text-[var(--ink-muted)]"
                    aria-hidden="true"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </span>
                </button>

              </div>
            )}

            {/* Groups */}
            <div id="tour-groups" className="grid gap-3 sm:grid-cols-3">
              {groups.map((raw) => {
                const entry = raw
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
                        {t.n(
                          t.common.categoryCount,
                          entry.categories.filter((c) => !c.featured).length
                        )}{" "}
                        · {t.n(t.common.serviceCount, entry.count)}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <CategoryStrip
              id="tour-categories"
              ref={chipsRef}
              groupSlug={group?.slug ?? ""}
              categories={group?.categories ?? []}
              selected={categorySlug}
              onSelect={(slug) => {
                setCategorySlug(slug)
                setQuery("")
              }}
            />

            <label className="relative mt-4 block">
              <span className="sr-only">{t.catalog.searchServices}</span>
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.f(t.catalog.searchIn, { category: category?.name ?? t.nav.services })}
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper-raised)] py-2.5 pl-9 pr-3 text-sm text-[var(--ink)] outline-none focus:border-primary"
              />
            </label>

            <div className="mt-5">
              {loading && items.length === 0 ? (
                <div
                  className="flex items-center justify-center gap-3 py-16"
                  role="status"
                >
                  <Loader2
                    className="h-5 w-5 animate-spin text-primary"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-[var(--ink-muted)]">
                    {t.catalog.loadingServices}
                  </span>
                </div>
              ) : failed ? (
                /* The category page is statically rendered and needs no fetch,
                   so it still works when this one does not. */
                <div className="rounded-xl border border-[var(--line)] p-8 text-center">
                  <p className="text-sm text-[var(--ink)]">
                    {t.catalog.loadFailed}
                  </p>
                  {!category?.featured && (
                    <Button variant="outline" className="mt-3" asChild>
                      <Link href={`/xidmetler/${categorySlug}`}>
                        {t.catalog.openCategoryPage}
                      </Link>
                    </Button>
                  )}
                </div>
              ) : visible.length === 0 ? (
                <p className="py-12 text-center text-sm text-[var(--ink-muted)]">
                  {t.f(t.catalog.noResults, { query })}
                </p>
              ) : (
                <>
                  <p className="mb-3 text-xs text-[var(--ink-muted)]">
                    {t.n(t.common.serviceCount, visible.length)} ·{" "}
                    {t.f(t.catalog.pricesForBranch, {
                      branch: branches.find((b) => b.id === DEFAULT_BRANCH)?.name ?? "",
                    })}
                  </p>
                  {/*
                    Keyed on the category so the cards replay their entrance
                    when it changes — without it React reuses the list and the
                    switch happens with no visible response at all.
                  */}
                  <ul
                    key={loadedSlug}
                    className={cn(
                      "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                      loading ? "list-fading" : "list-ready"
                    )}
                    aria-busy={loading || undefined}
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
      {/*
        The column is left to stretch (no items-start): the panel inside it is
        small, and sticky only has room to travel as far as its container. With
        the column shrunk to the panel, it scrolled out of view immediately —
        it now follows the catalogue down and stops at the end of the list.
      */}
      <aside className="hidden xl:block">
        {/*
          The tour anchor is on the panel, not on this column. The column is
          deliberately left to stretch so the sticky panel has room to travel,
          so it is as tall as the whole catalogue — and a highlight ring drawn
          around it enclosed most of the page rather than the basket.
        */}
        <BasketPanel id="tour-basket" />
      </aside>

      {tourOpen && (
        <PickerTour
          steps={[
            {
              target: "tour-patient",
              title: t.tour.patientTitle,
              body: t.tour.patientBody,
            },
            {
              target: "tour-groups",
              title: t.tour.groupTitle,
              body: t.tour.groupBody,
            },
            {
              target: "tour-categories",
              title: t.tour.categoryTitle,
              body: t.tour.categoryBody,
            },
            {
              target: "tour-basket",
              title: t.tour.basketTitle,
              body: t.tour.basketBody,
            },
          ]}
          onFinish={finishTour}
        />
      )}

      {/* Mounted only while open, so every appearance replays the entry
          animation. The dialog delays these callbacks until its exit animation
          has finished — see patient-prompt.tsx. */}
      {promptOpen && (
        <PatientPrompt
          patients={patients}
          selected={activePatientId}
          onChoose={chooseFromPrompt}
          /* Closed without choosing: point at the control anyway. Someone who
             dismissed the dialog is precisely the person who does not yet know
             where the choice went. */
          onDismiss={() => {
            setAnswered(true)
            startTour()
          }}
        />
      )}
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
  id,
  ref,
  groupSlug,
  categories,
  selected,
  onSelect,
}: {
  /** Anchor for the guided tour. */
  id?: string
  ref: React.RefObject<HTMLDivElement | null>
  groupSlug: string
  categories: PickerCategory[]
  selected: string
  onSelect: (slug: string) => void
}) {
  const t = useT()

  const scrollBy = (direction: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.8), behavior: "smooth" })
  }

  return (
    <div id={id} className="relative mt-4">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label={t.catalog.scrollBack}
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
        // Keyed on the group so the chips replay their entrance when it
        // changes; reusing the row made a group switch look like nothing had
        // happened up here at all.
        key={groupSlug}
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
        {categories.map((category, index) => {
          const active = category.slug === selected
          return (
            <button
              key={category.slug}
              style={{ "--chip-index": Math.min(index, 20) } as React.CSSProperties}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(category.slug)}
              className={cn(
                "chip-in snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-all duration-200 active:scale-95",
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
        aria-label={t.catalog.scrollForward}
        className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-white shadow-sm transition-colors hover:border-primary hover:text-primary md:flex"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function ServiceCard({ item, index }: { item: PickerItem; index: number }) {
  const t = useT()
  const price = priceOf(item)
  const promoted = promotedOf(item)
  const discounted = promoted !== null && promoted < price

  const line: BasketLine = {
    slug: item.slug,
    name: item.name,
    names: item.names,
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
        {item.prep ? `${t.catalog.readyIn}: ${item.prep}` : item.categoryName}
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
  const t = useT()
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
          {t.catalog.noOrdersYet}
        </p>
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          {t.catalog.ordersStoredHere}
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
                {t.n(t.common.serviceCount, order.lines.length)}
                {order.homeCollection && ` · ${t.basket.homeCollection}`}
                {` · ${order.paymentMethod === "CARD" ? t.basket.card : t.basket.cash}`}
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
                {t.catalog.reorder}
              </Button>
            </div>
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--line)] pt-3">
            {order.lines.map((line) => (
              <li
                key={line.slug}
                className="rounded-md bg-[var(--secondary)] px-2 py-1 text-xs text-[var(--ink)]"
              >
                {shortServiceName(lineName(line, t.locale))}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
