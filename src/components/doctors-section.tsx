"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import DoctorCard from "@/components/doctor-card"
import { AnimateOnScroll } from "@/components/animations"
import { departments, doctors } from "@/data"
import { useT } from "@/i18n/client"

/**
 * Doctors shown on the homepage before sending people to the full listing.
 * One row, not two — the section is a taster, and "{t.home.allDoctors}" carries
 * anyone who wants the rest.
 */
const FEATURED_COUNT = 4

export default function DoctorsSection() {
  const t = useT()
  const featured = doctors.slice(0, FEATURED_COUNT)

  return (
    <section className="bg-[var(--paper)] py-16 md:py-20">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm tracking-[0.14em] text-[var(--ink-muted)] uppercase">
                {t.home.doctorsEyebrow}
              </p>
              <h2 className="font-display text-step-3 text-[var(--ink)]">
                {t.f(t.home.doctorsHeading, { doctors: doctors.length, departments: departments.length })}
              </h2>
              <p className="mt-4 text-step-1 text-[var(--ink-muted)]">
{t.home.doctorsSubtitle}
              </p>
            </div>

            <Button variant="outline" size="lg" asChild className="shrink-0">
              <Link href="/hekimler">
                {t.home.allDoctors}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((doctor, i) => (
            <AnimateOnScroll key={doctor.id} delay={i * 60}>
              <DoctorCard doctor={doctor} priority={i < 4} className="h-full" />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
