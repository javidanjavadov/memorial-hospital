"use client"

import { useId, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Phone, Search } from "lucide-react"
import { contactInfo, departments, doctors, stats, telHref } from "@/data"

/**
 * Editorial split hero.
 *
 * Replaces a full-bleed photo behind a heavy dark scrim — a layout that buried
 * the photography and made the whole page feel like one saturated colour field.
 * Here the type column and the image column sit side by side on a warm neutral
 * ground, so the photograph is actually legible and the page opens light.
 */
export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const router = useRouter()
  const searchId = useId()
  const departmentId = useId()

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    if (selectedDepartment) params.set("dept", selectedDepartment)
    const query = params.toString()
    router.push(query ? `/hekimler?${query}` : "/hekimler")
  }

  return (
    <section className="bg-[var(--paper)]">
      <div className="container mx-auto px-4 pt-12 pb-8 md:pt-20 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Type column */}
          <div className="lg:col-span-6 xl:col-span-5">
            <p className="animate-fade-in-up text-[var(--ink-muted)] mb-6 flex items-center gap-2 text-sm tracking-[0.14em] uppercase">
              <span className="bg-accent inline-block h-px w-8" aria-hidden="true" />
              {contactInfo.workingHours.split(":")[0]} · Gəncədə 24/7
            </p>

            <h1 className="font-display animate-fade-in-up text-step-5 text-[var(--ink)] [animation-delay:80ms]">
              Sağlamlığınız
              <span className="text-primary block italic">bizim işimizdir</span>
            </h1>

            <p className="animate-fade-in-up text-step-1 text-[var(--ink-muted)] mt-7 max-w-lg [animation-delay:160ms]">
              {doctors.length} həkim, {departments.length} ixtisas və öz
              laboratoriyamız. Həkimi özünüz seçin — qalanını biz edək.
            </p>

            <form
              onSubmit={handleSearch}
              role="search"
              className="animate-fade-in-up mt-9 [animation-delay:240ms]"
            >
              <div className="border-line flex flex-col gap-2 rounded-2xl border bg-white p-2 shadow-[0_1px_2px_rgba(16,41,46,0.04),0_12px_32px_-16px_rgba(16,41,46,0.18)] sm:flex-row">
                <div className="relative flex-1">
                  <label htmlFor={searchId} className="sr-only">
                    Həkim adı və ya ixtisas
                  </label>
                  <Search
                    className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[var(--ink-muted)]"
                    aria-hidden="true"
                  />
                  <input
                    id={searchId}
                    type="search"
                    name="q"
                    placeholder="Həkim adı və ya ixtisas…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 w-full rounded-xl bg-transparent pr-3 pl-11 text-base placeholder:text-[var(--ink-muted)]/70 focus-visible:outline-none"
                  />
                </div>

                <label htmlFor={departmentId} className="sr-only">
                  İxtisas
                </label>
                <select
                  id={departmentId}
                  name="dept"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="text-[var(--ink)]/85 h-12 rounded-xl bg-[var(--secondary)] px-4 text-sm focus-visible:outline-none"
                >
                  <option value="">Bütün ixtisaslar</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>

                <Button type="submit" variant="cta" className="h-12 shrink-0 px-6">
                  Axtar
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </form>

            <div className="animate-fade-in-up mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 [animation-delay:320ms]">
              <Link
                href="/qebul"
                className="text-primary group inline-flex items-center gap-2 text-base font-semibold"
              >
                Onlayn qəbula yazıl
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <a
                href={telHref(contactInfo.phone)}
                className="text-[var(--ink-muted)] hover:text-[var(--ink)] inline-flex items-center gap-2 text-base transition-colors"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {contactInfo.phone}
              </a>
            </div>
          </div>

          {/* Image column — offset collage rather than a single flat banner */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="animate-fade-in-right relative [animation-delay:200ms]">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-[var(--secondary)] sm:aspect-[16/11]">
                <Image
                  src="/hero/hero-1.webp"
                  alt="Memorial Hospital"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>

              {/* Overlapping card grounds the image and carries a real fact. */}
              <div className="border-line absolute -bottom-6 -left-4 hidden rounded-2xl border bg-white/95 p-5 shadow-[0_16px_40px_-20px_rgba(16,41,46,0.35)] backdrop-blur-sm sm:block lg:-left-8">
                <p className="font-display text-step-2 text-[var(--ink)]">
                  {doctors.length}
                </p>
                <p className="text-[var(--ink-muted)] mt-1 text-sm">
                  həkim, {departments.length} ixtisas üzrə
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats rail — hairline separated, no boxes */}
      <div className="container mx-auto px-4">
        <dl className="rule mt-14 grid grid-cols-2 gap-y-8 pt-10 pb-14 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-3">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="font-display text-step-2 text-[var(--ink)] block">
                  {stat.value}
                </span>
                <span className="text-[var(--ink-muted)] mt-1 block text-sm">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
