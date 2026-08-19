"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimateOnScroll } from "@/components/animations"
import { departments, doctorsByDepartment } from "@/data"

/**
 * Specialty directory. Each entry links straight into the filtered doctor
 * listing, and shows how many doctors actually practise it — so the grid can
 * never advertise a specialty with nobody behind it.
 *
 * Only the first two rows are shown; the rest are behind a button. With 15
 * specialties the full grid pushed the sections below it well off the page.
 */

/** Two full rows at the widest breakpoint. */
const INITIAL_COUNT = 10

export default function DepartmentsSection() {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? departments : departments.slice(0, INITIAL_COUNT)
  const remaining = departments.length - INITIAL_COUNT

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm tracking-[0.14em] text-[var(--ink-muted)] uppercase">
              İxtisaslar
            </p>
            <h2 className="font-display text-step-3 text-[var(--ink)]">
              Şöbələrimiz
            </h2>
            <p className="mt-4 text-step-1 text-[var(--ink-muted)]">
              {departments.length} ixtisas üzrə diaqnostika və müalicə.
            </p>
          </div>
        </AnimateOnScroll>

        <ul
          id="departments-grid"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {visible.map((dept, i) => {
            const count = doctorsByDepartment(dept.id).length
            return (
              <li key={dept.id} className="h-full">
                {/*
                  Newly revealed cards animate from index 0 rather than their
                  position in the full list, so the second batch does not sit
                  waiting through the first batch's stagger.
                */}
                {/*
                  h-full has to be carried down every level: the grid stretches
                  the <li>, but this wrapper sits between it and the card, so
                  without it the card measures against the wrapper's auto height
                  and each box ends up as tall as its own text.
                */}
                <AnimateOnScroll
                  delay={(i % INITIAL_COUNT) * 40}
                  className="h-full"
                >
                  <Link
                    href={`/hekimler?dept=${dept.id}`}
                    className="group flex h-full flex-col rounded-xl bg-white p-5 ring-1 ring-[var(--line)] transition-colors duration-300 hover:ring-[var(--ink)]/25"
                  >
                    <span
                      className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)] text-[var(--ink)] transition-colors group-hover:bg-[var(--ink)] group-hover:text-white"
                      aria-hidden="true"
                    >
                      <dept.icon className="h-5 w-5" />
                    </span>
                    <span className="font-display block text-[var(--ink)]">
                      {dept.name}
                    </span>
                    <span className="mt-1 block flex-1 text-sm leading-relaxed text-[var(--ink-muted)]">
                      {dept.description}
                    </span>
                    {count > 0 && (
                      <span className="mt-3 block text-xs text-[var(--ink-muted)]">
                        {count} həkim
                      </span>
                    )}
                  </Link>
                </AnimateOnScroll>
              </li>
            )
          })}
        </ul>

        {remaining > 0 && (
          <div className="mt-10 text-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-controls="departments-grid"
            >
              {expanded ? "Daha az göstər" : `Daha çox göstər (${remaining})`}
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${
                  expanded ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
