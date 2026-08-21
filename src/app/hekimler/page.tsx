"use client"

import { Suspense, useId, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import DoctorCard from "@/components/doctor-card"
import { branches, departments, doctors } from "@/data"
import { useT } from "@/i18n/client"
import { localizeBranch, localizeDepartment } from "@/i18n/data"

export default function HekimlerPage() {
  return (
    <Suspense fallback={null}>
      <HekimlerContent />
    </Suspense>
  )
}

function HekimlerContent() {
  const t = useT()
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
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <p className="mb-3 text-sm tracking-[0.14em] text-[var(--ink-muted)] uppercase">
            {t.pages.doctorsEyebrow}
          </p>
          <h1 className="font-display text-step-4 max-w-3xl text-[var(--ink)]">
            {t.pages.doctorsTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            {t.f(t.ui.doctorsIntro, {
              doctors: doctors.length,
              departments: departments.length,
              branches: branches.length,
            })}
          </p>
        </div>
      </div>

      {/* Filters — sticky so they stay reachable while scrolling a long grid */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md md:top-20">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor={searchId} className="sr-only">
              {t.pages.searchDoctorLabel}
            </label>
            <Search
              className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              placeholder={t.pages.searchDoctorPlaceholder}
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
              {t.pages.filterBySpecialty}
            </label>
            <select
              id={deptId}
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className={`${selectClass} flex-1 sm:flex-none`}
            >
              <option value="">{t.pages.allSpecialties}</option>
              {departments.map((raw) => {
                const d = localizeDepartment(raw, t.data)
                return (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                )
              })}
            </select>

            <label htmlFor={branchId} className="sr-only">
              {t.pages.filterByBranch}
            </label>
            <select
              id={branchId}
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className={`${selectClass} flex-1 sm:flex-none`}
            >
              <option value="">{t.pages.allBranches}</option>
              {branches.map((raw) => {
                const b = localizeBranch(raw, t.data)
                return (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <p className="mb-6 text-sm text-slate-500" role="status">
          {t.f(t.ui.doctorsFound, { count: filtered.length })}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((doctor, i) => (
              <DoctorCard key={doctor.id} doctor={doctor} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
            <p className="mb-2 text-lg font-medium text-slate-700">
              {t.pages.noDoctorsFound}
            </p>
            <p className="mb-6 text-sm text-slate-500">
              {t.pages.noDoctorsHint}
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={resetFilters}>
                {t.pages.resetFilters}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
