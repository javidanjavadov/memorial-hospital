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
            <p className="mb-3 text-sm font-semibold tracking-wide text-teal-700 uppercase">
              İxtisaslar
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Şöbələrimiz
            </h2>
            <p className="mt-4 text-lg text-slate-600">
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
                  className="group flex h-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-teal-300 hover:bg-teal-50/40"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-100"
                    aria-hidden="true"
                  >
                    <dept.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-slate-900 transition-colors group-hover:text-teal-700">
                      {dept.name}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                      {dept.description}
                    </span>
                    {count > 0 && (
                      <span className="mt-2 block text-xs font-medium text-teal-700">
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
