import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import DoctorCard from "@/components/doctor-card"
import { AnimateOnScroll } from "@/components/animations"
import { departments, doctors } from "@/data"

/** Doctors shown on the homepage before sending people to the full listing. */
const FEATURED_COUNT = 8

export default function DoctorsSection() {
  const featured = doctors.slice(0, FEATURED_COUNT)

  return (
    <section className="bg-[var(--paper)] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm tracking-[0.14em] text-[var(--ink-muted)] uppercase">
                Həkim heyəti
              </p>
              <h2 className="font-display text-step-3 text-[var(--ink)]">
                {doctors.length} həkim, {departments.length} ixtisas
              </h2>
              <p className="mt-4 text-step-1 text-[var(--ink-muted)]">
                Üç filialımızda çalışan həkimlərimizlə birbaşa onlayn qəbula
                yazıla bilərsiniz.
              </p>
            </div>

            <Button variant="outline" size="lg" asChild className="shrink-0">
              <Link href="/hekimler">
                Bütün həkimlər
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
