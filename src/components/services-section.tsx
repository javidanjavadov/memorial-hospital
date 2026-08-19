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
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-sm tracking-[0.14em] text-[var(--ink-muted)] uppercase">
              Xidmətlər
            </p>
            <h2 className="font-display text-step-3 text-[var(--ink)]">
              Nə üçün müraciət edirsiniz?
            </h2>
            <p className="mt-4 text-step-1 text-[var(--ink-muted)]">
              Laboratoriya analizindən kompleks check-up müayinəyə qədər bütün
              xidmətlər bir yerdə.
            </p>
          </div>
        </AnimateOnScroll>

        {/*
          Compact rows rather than illustration-topped cards. Each card
          previously stacked a 40px-padded artwork panel above a 24px-padded
          text block, so five services filled most of a screen for very little
          information. The artwork now sits inline at 48px and the whole card is
          one line of padding.
        */}
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((service, i) => (
            <li key={service.id} className="h-full">
              <AnimateOnScroll delay={i * 70} className="h-full">
                <Link
                  href={service.href}
                  className="group flex h-full items-center gap-4 rounded-xl bg-white p-4 ring-1 ring-[var(--line)] transition-colors duration-300 hover:ring-[var(--ink)]/25"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)]">
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt=""
                        width={200}
                        height={188}
                        className="h-9 w-auto transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <Home
                        className="h-7 w-7 text-teal-600 transition-transform duration-500 group-hover:scale-110"
                        aria-hidden="true"
                      />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="font-display block text-[var(--ink)]">
                      {service.name}
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-[var(--ink-muted)]">
                      {service.description}
                    </span>
                  </span>

                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-[var(--primary)] transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </AnimateOnScroll>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
