"use client"

import Link from "next/link"
import { ArrowRight, Clock, FlaskConical, MapPin, ShieldCheck, Stethoscope, Users } from "lucide-react"
import { AnimateOnScroll } from "@/components/animations"
import { branches, departments, doctors, FOUNDED_YEAR, YEARS_OF_EXPERIENCE } from "@/data"
import { useT } from "@/i18n/client"

/*
 * Replaces the previous testimonials carousel.
 *
 * That section carried four invented patient reviews — fabricated names, ages
 * and quotes praising doctors who do not exist on the real roster. Fake reviews
 * on a hospital site mislead patients making medical decisions and breach
 * advertising rules in most jurisdictions, so it is gone rather than restyled.
 * Everything below is a verifiable fact about the hospital.
 *
 * If real, consented patient testimonials are collected later, they can be
 * reinstated as their own section.
 */
type T = ReturnType<typeof useT>

/* Built from the dictionary at render time: a module-level array is evaluated
   once at import, before any locale is known. */
const buildFacts = (t: T) => [
  {
    icon: Users,
    value: `${doctors.length}`,
    label: t.home.trustDoctor,
    detail: t.f(t.home.trustStaffDetail, { count: departments.length }),
  },
  {
    icon: MapPin,
    value: `${branches.length}`,
    label: t.basket.branch,
    detail: t.home.trustBranchesNote,
  },
  {
    icon: Clock,
    value: "24/7",
    label: t.home.trustGanjaBranch,
    detail: t.home.trustSevenDays,
  },
  {
    icon: ShieldCheck,
    value: `${YEARS_OF_EXPERIENCE}+`,
    label: t.home.trustYearsLabel,
    detail: t.f(t.home.trustSince, { year: FOUNDED_YEAR }),
  },
]

const buildCapabilities = (t: T) => [
  {
    icon: FlaskConical,
    title: t.home.trustOwnLab,
    body: t.home.trustOwnLabBody,
  },
  {
    icon: Stethoscope,
    title: t.home.trustSpecialists,
    body: t.home.trustSpecialistsBody,
  },
  {
    icon: Clock,
    title: t.home.trustOnlineBooking,
    body: t.home.trustOnlineBookingBody,
  },
]

export default function TrustSection() {
  const t = useT()
  const facts = buildFacts(t)
  const capabilities = buildCapabilities(t)
  return (
    <section className="bg-[var(--ink)] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold tracking-wide text-teal-400 uppercase">
              {t.home.whyTitle}
            </p>
            <h2 className="font-display text-step-3 text-white">
              {t.home.inNumbers}
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-[var(--ink)] p-6">
              <fact.icon className="mb-4 h-6 w-6 text-teal-400" aria-hidden="true" />
              <div className="font-display text-step-2 text-white">{fact.value}</div>
              <div className="mt-1 font-medium text-teal-100">{fact.label}</div>
              <p className="mt-2 text-sm leading-relaxed text-teal-200/70">
                {fact.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {capabilities.map((cap, i) => (
            <AnimateOnScroll key={cap.title} delay={i * 80}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                <cap.icon className="mb-4 h-6 w-6 text-teal-400" aria-hidden="true" />
                <h3 className="font-semibold text-white">{cap.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-teal-200/80">
                  {cap.body}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/haqqimizda"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-300 transition-colors hover:text-teal-200"
          >
            {t.home.moreAboutUs}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
