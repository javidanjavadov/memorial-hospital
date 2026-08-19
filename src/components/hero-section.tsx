"use client"

import { useId, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Search } from "lucide-react"
import { contactInfo, departments, doctors, telHref } from "@/data"

/**
 * Deliberately spare: one headline, one input, one link, one image.
 *
 * Earlier versions stacked a badge, headline, paragraph, search panel, two
 * buttons, an overlapping stat card and a stats rail into the first screen.
 * Removing most of that is the point — the page should open calm, and the
 * things that survive should be the things people actually came for.
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
      <div className="container mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-4xl">
          <h1 className="font-display animate-fade-in-up text-step-5 text-[var(--ink)]">
            Həkimi seçin.
            <br />
            <span className="text-[var(--ink-muted)]">Qalanını biz edək.</span>
          </h1>

          <form
            onSubmit={handleSearch}
            role="search"
            className="animate-fade-in-up mt-12 max-w-2xl [animation-delay:120ms]"
          >
            <div className="border-line flex flex-col gap-px overflow-hidden rounded-xl border bg-[var(--line)] sm:flex-row">
              <div className="relative flex-1 bg-white">
                <label htmlFor={searchId} className="sr-only">
                  Həkim adı və ya ixtisas
                </label>
                <Search
                  className="absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-[var(--ink-muted)]"
                  aria-hidden="true"
                />
                <input
                  id={searchId}
                  type="search"
                  name="q"
                  placeholder="Həkim adı və ya ixtisas"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 w-full bg-transparent pr-4 pl-11 text-base placeholder:text-[var(--ink-muted)]/60 focus-visible:outline-none"
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
                className="h-14 bg-white px-4 text-sm text-[var(--ink)] focus-visible:outline-none"
              >
                <option value="">Bütün ixtisaslar</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="h-14 bg-[var(--ink)] px-7 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]"
              >
                Axtar
              </button>
            </div>
          </form>

          <p className="animate-fade-in-up mt-6 text-sm text-[var(--ink-muted)] [animation-delay:200ms]">
            {doctors.length} həkim · {departments.length} ixtisas · 3 filial ·{" "}
            <a
              href={telHref(contactInfo.phone)}
              className="text-[var(--ink)] underline underline-offset-4 transition-colors hover:text-[var(--primary)]"
            >
              {contactInfo.phone}
            </a>
          </p>
        </div>
      </div>

      {/* Full-bleed image band — one strong visual, no scrim, no text on top */}
      <div className="animate-fade-in-up relative aspect-[21/9] w-full overflow-hidden md:aspect-[3/1] [animation-delay:160ms]">
        <Image
          src="/hero/hero-1.webp"
          alt="Memorial Hospital"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="container mx-auto px-4">
        <Link
          href="/qebul"
          className="group flex items-center justify-between gap-6 py-8 transition-colors"
        >
          <span className="font-display text-step-2 text-[var(--ink)] transition-colors group-hover:text-[var(--primary)]">
            Onlayn qəbula yazıl
          </span>
          <ArrowRight
            className="h-6 w-6 shrink-0 text-[var(--ink-muted)] transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-[var(--primary)]"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  )
}
