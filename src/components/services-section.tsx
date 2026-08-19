import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Home } from "lucide-react"
import { AnimateOnScroll } from "@/components/animations"
import { serviceCategories } from "@/data"

/**
 * Top-level service groups, matching how the hospital actually organises them.
 * The illustrations are the hospital's own brand artwork.
 */
export default function ServicesSection() {
  return (
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold tracking-wide text-teal-700 uppercase">
              Xidmətlər
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Nə üçün müraciət edirsiniz?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Laboratoriya analizindən kompleks check-up müayinəyə qədər bütün
              xidmətlər bir yerdə.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((service, i) => (
            <AnimateOnScroll key={service.id} delay={i * 70}>
              <Link
                href={service.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-teal-300 hover:shadow-[0_12px_32px_-12px_rgba(24,56,62,0.22)]"
              >
                <div className="flex items-center justify-center bg-teal-50/60 px-6 py-8">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt=""
                      width={200}
                      height={188}
                      className="h-32 w-auto transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Home
                      className="h-24 w-24 text-teal-600 transition-transform duration-500 group-hover:scale-105"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-teal-700">
                    {service.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
                    Ətraflı
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
