"use client"

import { Suspense, useId, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import DoctorCard from "@/components/doctor-card"
import { branches, departments, doctors } from "@/data"

export default function HekimlerPage() {
  return (
    <Suspense fallback={null}>
      <HekimlerContent />
    </Suspense>
  )
}

function HekimlerContent() {
  // Seeded from the URL (/hekimler?q=…&dept=…&branch=…) so the homepage search
  // can hand its query over, and so a filtered view is shareable.
  const searchParams = useSearchParams()
  const [filterDept, setFilterDept] = useState(searchParams.get("dept") ?? "")
  const [filterBranch, setFilterBranch] = useState(searchParams.get("branch") ?? "")
  const [search, setSearch] = useState(searchParams.get("q") ?? "")

  const searchId = useId()
  const deptId = useId()
  const branchId = useId()

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return doctors.filter((d) => {
      const matchDept = !filterDept || d.department === filterDept
      // Compare ids. Comparing the short display name against the full branch
      // name silently returned an empty list for every branch.
      const matchBranch = !filterBranch || d.branchId === filterBranch
      const matchSearch =
        !needle ||
        d.name.toLowerCase().includes(needle) ||
        d.specialty.toLowerCase().includes(needle)
      return matchDept && matchBranch && matchSearch
    })
  }, [filterDept, filterBranch, search])

  const hasFilters = Boolean(search || filterDept || filterBranch)

  const resetFilters = () => {
    setSearch("")
    setFilterDept("")
    setFilterBranch("")
  }

  const selectClass =
    "h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors hover:border-slate-300 focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:outline-none"

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-teal-700 uppercase">
            Həkim heyəti
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Həkimlərimiz
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            {doctors.length} həkim, {departments.length} ixtisas üzrə{" "}
            {branches.length} filialda. Axtarın, filtrləyin və birbaşa qəbula
            yazılın.
          </p>
        </div>
      </div>

      {/* Filters — sticky so they stay reachable while scrolling a long grid */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md md:top-20">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor={searchId} className="sr-only">
              Həkim və ya ixtisas axtar
            </label>
            <Search
              className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              placeholder="Həkim adı və ya ixtisas…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-10 text-sm transition-colors hover:border-slate-300 focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal
              className="hidden h-5 w-5 shrink-0 text-slate-400 sm:block"
              aria-hidden="true"
            />
            <label htmlFor={deptId} className="sr-only">
              İxtisasa görə süz
            </label>
            <select
              id={deptId}
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className={`${selectClass} flex-1 sm:flex-none`}
            >
              <option value="">Bütün ixtisaslar</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <label htmlFor={branchId} className="sr-only">
              Filiala görə süz
            </label>
            <select
              id={branchId}
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className={`${selectClass} flex-1 sm:flex-none`}
            >
              <option value="">Bütün filiallar</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <p className="mb-6 text-sm text-slate-500" role="status">
          {filtered.length} həkim tapıldı
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((doctor, i) => (
              <DoctorCard key={doctor.id} doctor={doctor} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
            <p className="mb-2 text-lg font-medium text-slate-700">
              Heç bir həkim tapılmadı
            </p>
            <p className="mb-6 text-sm text-slate-500">
              Axtarış şərtlərini dəyişməyi yoxlayın.
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Filtrləri sıfırla
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
