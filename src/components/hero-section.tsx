import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck,
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
 * Two-column hero: proof and actions on the left, photography with overlapping
 * cards on the right.
 *
 * Every number is derived from the real roster rather than typed in, so the
 * hero cannot drift out of step with the rest of the page the way the old
 * hardcoded "50+ doctors" did.
 */

const badges = [
  { icon: ShieldCheck, label: "Lisenziyalı klinika" },
  { icon: Clock, label: "Gəncədə 24/7" },
  { icon: Star, label: `${YEARS_OF_EXPERIENCE} il təcrübə` },
]

/** The longest-serving doctor — a real name, not an invented "next available". */
const featuredDoctor = [...doctors].sort((a, b) => b.experience - a.experience)[0]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--paper)] via-[var(--paper)] to-primary/5">
      <div className="container mx-auto px-4 py-14 md:py-20 lg:py-24">
        {/*
          items-stretch, not items-center: the right column should run the full
          height of the left one rather than floating in the middle of it.
        */}
        <div className="grid items-stretch gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ---------------- Left: message + proof + actions ---------------- */}
          <div>
            <ul className="mb-6 flex flex-wrap gap-2">
              {badges.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper-raised)] px-3 py-1.5 text-xs font-medium text-[var(--ink-muted)]"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>

            <h1 className="font-display text-step-4 text-[var(--ink)]">
              Sağlamlığınız üçün{" "}
              <span className="text-primary">peşəkar qayğı</span>
            </h1>

            <p className="mt-5 max-w-xl text-step-0 text-[var(--ink-muted)]">
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
                  <dd className="font-display text-step-2 text-primary">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </dd>
                  <dt className="mt-1 text-sm text-[var(--ink-muted)]">
                    {stat.label}
                  </dt>
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
              <Button variant="outline" size="lg" asChild>
                <Link href="/hekimler">
                  <Stethoscope className="h-5 w-5" aria-hidden="true" />
                  Həkimlərə bax
                </Link>
              </Button>
            </div>

            <a
              href={telHref(contactInfo.phone)}
              className="mt-8 inline-flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-4 transition-colors hover:border-primary/40"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10"
                aria-hidden="true"
              >
                <Phone className="h-5 w-5 text-primary" />
              </span>
              <span>
                <span className="block text-xs text-[var(--ink-muted)]">
                  Çağrı mərkəzi
                </span>
                <span className="block font-semibold text-[var(--ink)]">
                  {contactInfo.phone}
                </span>
              </span>
            </a>
          </div>

          {/* ---------------- Right: photography + overlapping cards --------- */}
          <div className="relative">
            {/*
              Fixed 8:5 while the columns are stacked, then simply fills the
              row once they sit side by side — so its height is whatever the
              text column needs, and the two always line up.
            */}
            <div className="relative aspect-[8/5] overflow-hidden rounded-3xl lg:aspect-auto lg:h-full">
              {/*
                The public/hero/hero-N.webp files are NOT photographs — each is a
                promotional banner for a single lab test with Azerbaijani text
                baked into a 1800x600 strip. Cropped into this portrait frame
                one showed a vertical sliver of that text.

                This is a stock clinical photograph (Unsplash License: free for
                commercial use, no attribution required). Anonymous by design —
                no identifiable face and no third-party clinic branding, so it
                cannot imply a stranger is Memorial staff alongside the 33 real
                doctor portraits further down the page.
              */}
              <Image
                src="/hero/hero-consultation.webp"
                alt="Ağ xalatlı həkim stetoskop tutarkən"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>

            {/*
              Hidden below lg: overlapping cards need room to sit outside the
              image, and on a narrow screen they would cover the photograph.
            */}
            <div className="pointer-events-none absolute -left-4 top-4 hidden lg:block">
              <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-4 shadow-lg">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
                  aria-hidden="true"
                >
                  <CalendarCheck className="h-5 w-5 text-primary" />
                </span>
                <span>
                  <span className="block text-xs text-[var(--ink-muted)]">
                    Ən təcrübəli həkimimiz
                  </span>
                  <span className="block text-sm font-semibold text-[var(--ink)]">
                    {featuredDoctor.name.split(" - ")[0]}
                  </span>
                  <span className="block text-xs text-[var(--ink-muted)]">
                    {featuredDoctor.specialty} · {featuredDoctor.experience} il
                  </span>
                </span>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-4 -bottom-4 hidden lg:block">
              <div className="pointer-events-auto rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-4 shadow-lg">
                <span className="block text-xs text-[var(--ink-muted)]">
                  Filiallarımız
                </span>
                <span className="mt-1 block font-display text-step-1 text-primary">
                  {branches.length}
                </span>
                <span className="block text-xs text-[var(--ink-muted)]">
                  Bakı və Gəncə
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
