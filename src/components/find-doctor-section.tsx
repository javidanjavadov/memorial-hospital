"use client"

import { useId, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Stethoscope, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { branches, departments } from "@/data"

/**
 * Doctor search, lifted out of the hero.
 *
 * It used to be the hero's only element, which made the first screen a form
 * rather than an introduction. As its own band it can carry a heading that
 * explains what it searches, and the hero is free to lead with the hospital.
 *
 * Submitting hands the query to /hekimler, which seeds its filters from the URL
 * — so a filtered result is also a shareable link.
 */
export default function FindDoctorSection() {
  const [query, setQuery] = useState("")
  const [department, setDepartment] = useState("")
  const [branch, setBranch] = useState("")
  const router = useRouter()

  const queryId = useId()
  const departmentId = useId()
  const branchId = useId()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (department) params.set("dept", department)
    if (branch) params.set("branch", branch)
    const search = params.toString()
    router.push(search ? `/hekimler?${search}` : "/hekimler")
  }

  const field =
    "h-12 w-full rounded-lg border border-[var(--line)] bg-[var(--paper-raised)] px-4 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <section className="bg-primary/5 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-primary">
            HƏKİM AXTAR
          </p>
          <h2 className="font-display text-step-3 text-[var(--ink)]">
            Sizə uyğun həkimi tapın
          </h2>
          <p className="mt-3 text-[var(--ink-muted)]">
            Ad, ixtisas və ya filiala görə axtarın — nəticələr birbaşa qəbul
            səhifəsinə bağlanır.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          role="search"
          className="mx-auto mt-8 max-w-4xl rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-4 shadow-sm md:p-5"
        >
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
            <div className="relative">
              <label htmlFor={queryId} className="sr-only">
                Həkim adı və ya ixtisas
              </label>
              <User
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ink-muted)]"
                aria-hidden="true"
              />
              <input
                id={queryId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Həkim adı və ya ixtisas"
                className={`${field} pl-10`}
              />
            </div>

            <div>
              <label htmlFor={departmentId} className="sr-only">
                İxtisas
              </label>
              <select
                id={departmentId}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={field}
              >
                <option value="">Bütün ixtisaslar</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={branchId} className="sr-only">
                Filial
              </label>
              <select
                id={branchId}
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className={field}
              >
                <option value="">Bütün filiallar</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" variant="cta" size="lg" className="md:w-auto">
              <Search className="h-5 w-5" aria-hidden="true" />
              Axtar
            </Button>
          </div>
        </form>

        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--ink-muted)]">
          <Stethoscope className="h-4 w-4 text-primary" aria-hidden="true" />
          Qəbul saatları və qiymətlər həkim səhifəsində göstərilir.
        </p>
      </div>
    </section>
  )
}
