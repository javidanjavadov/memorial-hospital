"use client"

import { useId, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Phone, Search } from "lucide-react"
import { branches, contactInfo, departments, doctors, stats, telHref } from "@/data"

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const router = useRouter()
  const searchId = useId()
  const departmentId = useId()

  /** Carries the query into /hekimler rather than discarding it. */
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    if (selectedDepartment) params.set("dept", selectedDepartment)
    const query = params.toString()
    router.push(query ? `/hekimler?${query}` : "/hekimler")
  }

  return (
    <section className="relative overflow-hidden bg-teal-950">
      {/* Photography carries the hero; the overlay keeps text contrast legible
          over an image whose composition we do not control. */}
      <div className="absolute inset-0">
        <Image
          src="/hero/hero-1.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-teal-950 via-teal-950/90 to-teal-950/60"
          aria-hidden="true"
        />
      </div>

      <div className="relative container mx-auto px-4 py-20 md:py-28 lg:py-32">
        <div className="max-w-2xl">
          <p className="animate-fade-in-up mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-teal-50 backdrop-blur-sm">
            {branches.length} filial · Gəncədə 24/7
          </p>

          <h1 className="animate-fade-in-up text-4xl leading-[1.1] font-bold tracking-tight text-white [animation-delay:100ms] md:text-5xl lg:text-6xl">
            Sağlamlığınız
            <span className="block text-teal-300">bizim prioritetimizdir</span>
          </h1>

          <p className="animate-fade-in-up mt-6 max-w-xl text-lg leading-relaxed text-teal-100/90 [animation-delay:200ms]">
            {doctors.length} həkim, {departments.length} ixtisas və müasir
            laboratoriya. Onlayn qəbula yazılın — reqistratura sizə zəng etsin.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            role="search"
            className="animate-fade-in-up mt-8 rounded-2xl bg-white p-3 shadow-2xl [animation-delay:300ms] sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <label htmlFor={searchId} className="sr-only">
                  Həkim adı və ya ixtisas
                </label>
                <Search
                  className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id={searchId}
                  type="search"
                  name="q"
                  placeholder="Həkim adı və ya ixtisas…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 pr-4 pl-10 text-base transition-colors focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:outline-none"
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
                className="h-12 rounded-lg border border-slate-200 px-4 text-base transition-colors focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:outline-none"
              >
                <option value="">Bütün ixtisaslar</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <Button type="submit" variant="cta" size="lg" className="h-12 shrink-0">
                <Search className="h-5 w-5" aria-hidden="true" />
                Axtar
              </Button>
            </div>
          </form>

          <div className="animate-fade-in-up mt-6 flex flex-col gap-3 [animation-delay:400ms] sm:flex-row">
            <Button variant="cta" size="lg" asChild>
              <Link href="/qebul">
                <Calendar className="h-5 w-5" aria-hidden="true" />
                Qəbula yazıl
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              asChild
            >
              <a href={telHref(contactInfo.phone)}>
                <Phone className="h-5 w-5" aria-hidden="true" />
                {contactInfo.phone}
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative border-t border-white/10 bg-teal-950/80 backdrop-blur-sm">
        <div className="container mx-auto grid grid-cols-2 gap-px px-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 py-6">
              <stat.icon className="h-5 w-5 shrink-0 text-teal-400" aria-hidden="true" />
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-teal-200/80">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
