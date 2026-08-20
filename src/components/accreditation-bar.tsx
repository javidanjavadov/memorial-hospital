"use client"

import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { accreditations } from "@/data/accreditations"
import { useT } from "@/i18n/client"
import { localizeAccreditation } from "@/i18n/data"

/**
 * Accreditation marks directly under the hero.
 *
 * The full section further down was below the fold, so a visitor never saw the
 * laboratory's strongest credentials on arrival. The hero itself has no room
 * left for them, so they get their own slim band immediately after it — at
 * 78svh of hero plus this strip, the marks are on screen when the page loads.
 *
 * Marks only here; the section lower down carries the explanation.
 */
export default function AccreditationBar() {
  const t = useT()
  return (
    <section
      // shrink-0: inside the homepage one-screen block it must keep its full
      // height and let the photograph absorb the difference.
      className="shrink-0 bg-primary text-white"
      aria-label={t.home.accreditationBarLabel}
    >
      <div className="container mx-auto px-4">
        {/*
          Stacked on mobile the label and link push the strip past the fold,
          which defeats the point of moving it up here. Below md only the marks
          are kept — they are what has to be seen on arrival.
        */}
        <div className="flex flex-col items-center gap-6 py-5 md:flex-row md:justify-between">
          <p className="hidden items-center gap-2 text-sm font-medium text-white/80 md:flex">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            Beynəlxalq keyfiyyət standartları
          </p>

          {/*
            Wordmarks here, not the official artwork. The logos are dark and
            would need white plates to sit on this teal band, which turns a
            clean strip into a row of boxes. The real marks are reproduced in
            the section below, where there is room to give them their own
            treatment.
          */}
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
            {accreditations.map((raw) => {
            const item = localizeAccreditation(raw, t.data)
            return (
              <li key={item.mark} className="text-center">
                <span className="font-display block text-2xl leading-none tracking-tight md:text-3xl">
                  {item.mark}
                </span>
                <span className="mt-1 block text-[0.65rem] tracking-[0.16em] text-white/70 uppercase">
                  {item.markNote}
                </span>
              </li>
              )
            })}
          </ul>

          <Link
            href="#akkreditasiya"
            className="hidden items-center gap-1.5 text-sm font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline md:inline-flex"
          >
            Ətraflı
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
