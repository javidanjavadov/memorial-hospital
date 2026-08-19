import Link from "next/link"
import { AnimateOnScroll } from "@/components/animations"
import { departments, doctorsByDepartment } from "@/data"

/**
 * Specialty directory. Each entry links straight into the filtered doctor
 * listing, and shows how many doctors actually practise it — so the grid can
 * never advertise a specialty with nobody behind it.
 */
export default function DepartmentsSection() {
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept, i) => {
            const count = doctorsByDepartment(dept.id).length
            return (
              <AnimateOnScroll key={dept.id} delay={i * 40}>
                <Link
                  href={`/hekimler?dept=${dept.id}`}
                  className="group flex h-full items-start gap-4 rounded-xl bg-white p-5 ring-1 ring-[var(--line)] transition-colors duration-300 hover:ring-[var(--ink)]/25"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)] text-[var(--ink)] transition-colors group-hover:bg-[var(--ink)] group-hover:text-white"
                    aria-hidden="true"
                  >
                    <dept.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="font-display block text-[var(--ink)]">
                      {dept.name}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-[var(--ink-muted)]">
                      {dept.description}
                    </span>
                    {count > 0 && (
                      <span className="mt-2 block text-xs text-[var(--ink-muted)]">
                        {count} həkim
                      </span>
                    )}
                  </span>
                </Link>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
