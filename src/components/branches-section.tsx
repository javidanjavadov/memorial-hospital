"use client"

import { useState } from "react"
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

type View = "grid" | "map"

export default function BranchesSection() {
  const [view, setView] = useState<View>("grid")

  return (
    <section className="py-16 md:py-24 bg-[var(--paper)]">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Filiallarımız
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sizinə ən yaxın filialı seçin və keyfiyyətli tibbi xidmətdən
            yararlanın
          </p>
        </div>
        </AnimateOnScroll>

        <div
          role="tablist"
          aria-label="Filial görünüşü"
          className="mb-8 flex justify-center gap-1 rounded-lg border border-[var(--line)] bg-white p-1 mx-auto w-fit"
        >
          {([
            { id: "grid", label: "Siyahı", icon: LayoutGrid },
            { id: "map", label: "Xəritə", icon: MapIcon },
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

        {view === "map" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {branches.map((branch, i) => (
              <AnimateOnScroll key={branch.id} delay={i * 100}>
                <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                  {/*
                    OpenStreetMap rather than Google: it embeds without an API
                    key or a billing account, and sets no advertising cookies on
                    a page that also handles health data. One map per branch —
                    Ganja is ~300km from Baku, so a single map holding all three
                    would be zoomed out to the whole country.
                  */}
                  <iframe
                    title={`${branch.name} xəritədə`}
                    loading="lazy"
                    className="h-56 w-full border-0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      Number(branch.longitude) - 0.006
                    }%2C${Number(branch.latitude) - 0.004}%2C${
                      Number(branch.longitude) + 0.006
                    }%2C${Number(branch.latitude) + 0.004}&layer=mapnik&marker=${
                      branch.latitude
                    }%2C${branch.longitude}`}
                  />
                  <div className="p-5">
                    <h3 className="font-display text-lg text-slate-900">
                      {branch.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{branch.address}</p>
                    <a
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <Navigation className="h-4 w-4" aria-hidden="true" />
                      Yol göstər
                    </a>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        )}

        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-3 gap-6",
            view !== "grid" && "hidden"
          )}
        >
          {branches.map((branch, i) => (
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
                      Zəng Et
                    </a>
                  </Button>
                  <Button variant="cta" className="flex-1" asChild>
                    <Link href="/qebul">
                      Qəbula Yazıl
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
