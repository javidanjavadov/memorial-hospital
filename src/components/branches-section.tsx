"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Navigation,
  LayoutGrid,
  Map as MapIcon,
} from "lucide-react"
import { branches, telHref } from "@/data"
import { AnimateOnScroll } from "@/components/animations"
import { cn } from "@/lib/utils"
import { useT } from "@/i18n/client"
import { localizeBranch } from "@/i18n/data"

// Leaflet reaches for `window` at import time, so it cannot be server-rendered.
const BranchesMap = dynamic(() => import("@/components/branches-map"), {
  ssr: false,
  loading: () => <MapLoading />,
})

type View = "grid" | "map"

/* Its own component so it can read the dictionary: the `loading` callback that
   dynamic() takes is evaluated outside any component, where a hook cannot run. */
function MapLoading() {
  const t = useT()
  return (
    <div
      className="flex h-[420px] items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--secondary)] text-sm text-slate-600 lg:h-[520px]"
      role="status"
    >
      {t.home.mapLoading}
    </div>
  )
}

export default function BranchesSection() {
  const t = useT()
  const [view, setView] = useState<View>("grid")

  return (
    <section className="py-16 md:py-24 bg-[var(--paper)]">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t.home.branchesTitle}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
{t.home.branchesSubtitle}
          </p>
        </div>
        </AnimateOnScroll>

        <div
          role="tablist"
          aria-label={t.home.branchView}
          className="mb-8 flex justify-center gap-1 rounded-lg border border-[var(--line)] bg-white p-1 mx-auto w-fit"
        >
          {([
            { id: "grid", label: t.home.listView, icon: LayoutGrid },
            { id: "map", label: t.home.mapView, icon: MapIcon },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={view === tab.id}
              onClick={() => setView(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                view === tab.id
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>

        {view === "map" && <BranchesMap />}

        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-3 gap-6",
            view !== "grid" && "hidden"
          )}
        >
          {branches.map((raw, i) => {
            const branch = localizeBranch(raw, t.data)
            return (
            <AnimateOnScroll key={branch.id} delay={i * 100}>
            <Card
              id={branch.id}
              className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <div className="h-48 bg-[var(--secondary)] relative overflow-hidden">
                {/* The hospital's own photograph of the building, in place of
                    the map-pin placeholder that used to sit here. */}
                <Image
                  src={branch.image}
                  alt={branch.name}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4">
                  <a
                    href={branch.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-12"
                  >
                    <Navigation className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors duration-300">
                  {branch.name}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">{branch.address}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <a
                      href={telHref(branch.phone)}
                      className="text-sm text-slate-600 hover:text-primary transition-colors duration-200"
                    >
                      {branch.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">
                      {branch.workingHours}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex gap-3">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={telHref(branch.phone)}>
                      <Phone className="w-4 h-4" />
                      {t.home.callButton}
                    </a>
                  </Button>
                  <Button variant="cta" className="flex-1" asChild>
                    <Link href="/qebul">
                      {t.home.bookButton}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
