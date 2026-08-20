"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/client"
import { CountUp } from "@/components/animations"
import {
  branches,
  departments,
  doctors,
  YEARS_OF_EXPERIENCE,
} from "@/data"

/**
 * Full-bleed hero: the photograph is the background and the content sits on it.
 *
 * Height is a fraction of the viewport rather than all of it, so the section
 * below is visible at the fold and the page reads as having more to it.
 *
 * `svh` rather than `vh`: on mobile `vh` measures the viewport with the browser
 * chrome hidden, so a `vh` hero runs taller than the screen. The min-height
 * keeps the content from being clipped on short landscape screens, and the
 * max-height stops it ballooning on very tall monitors.
 *
 * Every figure comes from the roster rather than being typed in.
 */

/* Built inside the component: a module-level array is evaluated once at import,
   before any locale is known. */
const buildBadges = (t: ReturnType<typeof useT>) => [
  {
    icon: ShieldCheck,
    label: t.f(t.home.heroBadgeBranches, { count: branches.length }),
  },
  { icon: Clock, label: t.home.heroBadgeGanja },
  {
    icon: Star,
    label: t.f(t.home.heroBadgeYears, { count: YEARS_OF_EXPERIENCE }),
  },
]

export default function HeroSection() {
  const t = useT()
  const badges = buildBadges(t)

  return (
    /*
      Height comes from the wrapper on the homepage, which sizes the header, the
      photograph and the accreditation bar to exactly one screen: this takes
      whatever is left over. The top padding keeps the content clear of the
      (transparent) navbar the photograph runs behind.

      The min-height is the floor for short laptop screens — below it the
      heading and the buttons would start colliding, and a cramped hero is
      worse than one that pushes the bar slightly below the fold.
    */
    <section className="relative flex w-full flex-1 items-center overflow-hidden pt-16 min-h-[26rem] md:pt-20">
      <Image
        src="/hero/hero-lab.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        aria-hidden="true"
      />

      {/*
        Two layers: a horizontal gradient anchoring the text column, plus a flat
        wash. Without the second one the white type disappears into the white
        coat wherever the photograph is brightest.
      */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[var(--ink)]/95 via-[var(--ink)]/75 to-[var(--ink)]/25"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[var(--ink)]/25" aria-hidden="true" />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-2xl text-white">
          <ul className="mb-6 flex flex-wrap gap-2">
            {badges.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <h1 className="font-display text-step-4">
            {t.home.heroLead}{" "}
            <span className="text-[var(--accent)]">{t.home.heroTitle}</span>
          </h1>

          <p className="mt-4 max-w-xl text-step-0 text-white/80">
            {t.f(t.home.heroSubtitle, {
              doctors: doctors.length,
              departments: departments.length,
              branches: branches.length,
            })}
          </p>

          <dl className="mt-7 grid max-w-lg grid-cols-3 gap-4">
            {[
              { value: doctors.length, suffix: "", label: t.home.statDoctor },
              { value: departments.length, suffix: "", label: t.home.statSpecialty },
              { value: YEARS_OF_EXPERIENCE, suffix: "+", label: t.home.statYears },
            ].map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-step-2 text-white">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </dd>
                <dt className="mt-1 text-sm text-white/70">{stat.label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="cta" size="lg" asChild>
              <Link href="/qebul">
                {t.home.heroBook}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              asChild
            >
              <Link href="/hekimler">
                <Stethoscope className="h-5 w-5" aria-hidden="true" />
                {t.home.heroDoctors}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
