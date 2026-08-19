import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Clock,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CountUp } from "@/components/animations"
import {
  branches,
  contactInfo,
  departments,
  doctors,
  telHref,
  YEARS_OF_EXPERIENCE,
} from "@/data"

/**
 * Full-bleed hero: the photograph is the background and the content sits on it.
 *
 * Height is exactly one viewport — `svh` rather than `vh`, because on mobile
 * `vh` measures the viewport with the browser chrome hidden, so a `vh` hero
 * runs taller than the screen and its bottom row is clipped until the visitor
 * scrolls. The min-height keeps it usable on short landscape screens where one
 * viewport cannot hold the content.
 *
 * Every figure comes from the roster rather than being typed in.
 */

const badges = [
  { icon: ShieldCheck, label: "IAS akkreditasiyalı laboratoriya" },
  { icon: Clock, label: "Gəncədə 24/7" },
  { icon: Star, label: `${YEARS_OF_EXPERIENCE} il təcrübə` },
]

export default function HeroSection() {
  return (
    <section className="relative flex h-svh min-h-[680px] w-full items-center overflow-hidden">
      <Image
        src="/hero/hero-fullscreen.webp"
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
            Sağlamlığınız üçün{" "}
            <span className="text-[var(--accent)]">peşəkar qayğı</span>
          </h1>

          <p className="mt-5 max-w-xl text-step-0 text-white/80">
            {doctors.length} həkim, {departments.length} ixtisas və{" "}
            {branches.length} filial. Laboratoriya analizindən kompleks check-up
            müayinəyə qədər — hamısı bir yerdə.
          </p>

          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4">
            {[
              { value: doctors.length, suffix: "", label: "Həkim" },
              { value: departments.length, suffix: "", label: "İxtisas" },
              { value: YEARS_OF_EXPERIENCE, suffix: "+", label: "İl təcrübə" },
            ].map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-step-2 text-white">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </dd>
                <dt className="mt-1 text-sm text-white/70">{stat.label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="cta" size="lg" asChild>
              <Link href="/qebul">
                Onlayn qəbula yazıl
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
                Həkimlərə bax
              </Link>
            </Button>
          </div>

          <a
            href={telHref(contactInfo.phone)}
            className="mt-8 inline-flex items-center gap-4 rounded-xl border border-white/25 bg-white/10 p-4 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15"
              aria-hidden="true"
            >
              <Phone className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs text-white/70">Çağrı mərkəzi</span>
              <span className="block font-semibold">{contactInfo.phone}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
