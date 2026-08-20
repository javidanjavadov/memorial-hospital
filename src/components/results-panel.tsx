"use client"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Calendar,
  FileText,
  Loader2,
  MapPin,
  Stethoscope,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { branches, contactInfo, telHref } from "@/data"
import { useT } from "@/i18n/client"
import { cn } from "@/lib/utils"
import type { PublicResult } from "@/lib/results-store"

const formatDate = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.valueOf())) return iso
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

/**
 * The patient's own results, laid out like the report itself: one block per
 * panel, one row per test, with the value beside its reference range.
 *
 * A result that sits outside its range is marked with an arrow and a colour,
 * and the word is spelled out for a screen reader — a red number alone says
 * nothing to someone who cannot see it, and this is exactly the information
 * people are here for.
 *
 * Nothing is interpreted. A raised figure is shown as raised, never as a
 * diagnosis; that belongs to the doctor, and the panel says so at the bottom.
 */
export default function ResultsPanel({ patientName }: { patientName: string }) {
  const t = useT()
  const [results, setResults] = useState<PublicResult[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch("/api/results")
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status))
        return response.json()
      })
      .then((data: { results: PublicResult[] }) => {
        if (!cancelled) setResults(data.results ?? [])
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (failed) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-8 text-center">
        <AlertCircle
          className="mx-auto mb-3 h-8 w-8 text-[var(--ink-muted)]"
          aria-hidden="true"
        />
        <p className="text-sm text-[var(--ink)]">{t.results.loadFailed}</p>
      </div>
    )
  }

  if (results === null) {
    return (
      <div className="flex items-center justify-center gap-3 py-16" role="status">
        <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
        <span className="text-sm text-[var(--ink-muted)]">{t.common.loading}</span>
      </div>
    )
  }

  if (results.length === 0) {
    /*
     * "No results yet", not "you have no results". For someone waiting on a
     * biopsy those are very different sentences, and only the first one is
     * true: the laboratory system is simply not connected here.
     */
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-10 text-center">
        <FileText
          className="mx-auto mb-3 h-10 w-10 text-[var(--ink-muted)]"
          aria-hidden="true"
        />
        <p className="font-medium text-[var(--ink)]">{t.results.emptyTitle}</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-[var(--ink-muted)]">
          {t.results.emptyBody}
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <a href={telHref(contactInfo.phone)}>{contactInfo.phone}</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {results.map((result) => {
        const branch = branches.find((b) => b.id === result.branch)

        return (
          <article
            key={result.id}
            className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--paper-raised)]"
          >
            <header className="border-b border-[var(--line)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium uppercase text-[var(--ink)]">
                    {patientName}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--ink-muted)]">
                    {t.results.cardNo}: {result.cardNo}
                  </p>
                </div>

                {result.hasPdf && (
                  <Button variant="cta" size="sm" asChild>
                    {/*
                      Streamed by a route handler that checks the session, not a
                      file under public/ — a public URL would be readable by
                      anyone who learned the path, forever.
                    */}
                    <a
                      href={`/api/results/${result.id}/pdf`}
                      target="_blank"
                      rel="noopener"
                    >
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      {t.results.openPdf}
                    </a>
                  </Button>
                )}
              </div>

              <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Calendar
                    className="h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>
                    <dt className="text-[var(--ink-muted)]">
                      {t.results.collected}
                    </dt>
                    <dd className="font-medium text-[var(--ink)]">
                      {formatDate(result.collectedAt)}
                    </dd>
                  </span>
                </div>

                {branch && (
                  <div className="flex items-center gap-2">
                    <MapPin
                      className="h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>
                      <dt className="text-[var(--ink-muted)]">
                        {t.results.branch}
                      </dt>
                      <dd className="font-medium text-[var(--ink)]">
                        {branch.name}
                      </dd>
                    </span>
                  </div>
                )}

                {result.doctor && (
                  <div className="flex items-center gap-2">
                    <Stethoscope
                      className="h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>
                      <dt className="text-[var(--ink-muted)]">
                        {t.results.doctor}
                      </dt>
                      <dd className="font-medium text-[var(--ink)]">
                        {result.doctor}
                      </dd>
                    </span>
                  </div>
                )}
              </dl>
            </header>

            {result.panels.map((panel) => (
              <section key={panel.name}>
                <h3 className="border-b border-[var(--line)] bg-[var(--secondary)] px-5 py-2 text-xs font-semibold tracking-wide text-[var(--ink)] uppercase">
                  {panel.name}
                </h3>

                {/* Its own scroller: a reference range column must not make the
                    whole page scroll sideways on a phone. */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[34rem] text-sm">
                    <thead>
                      <tr className="text-left text-xs text-[var(--ink-muted)]">
                        <th scope="col" className="px-5 py-2 font-medium">
                          {t.results.test}
                        </th>
                        <th scope="col" className="px-3 py-2 font-medium">
                          {t.results.value}
                        </th>
                        <th scope="col" className="px-3 py-2 font-medium">
                          {t.results.unit}
                        </th>
                        <th scope="col" className="px-5 py-2 font-medium">
                          {t.results.reference}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {panel.tests.map((test) => {
                        const high = test.flag === "high"
                        const low = test.flag === "low"
                        const abnormal = high || low

                        return (
                          <tr key={`${panel.name}-${test.name}`}>
                            <td className="px-5 py-2.5">
                              <span className="text-[var(--ink)]">{test.name}</span>
                              {test.code && (
                                <span className="ml-2 font-mono text-[0.65rem] text-[var(--ink-muted)]">
                                  {test.code}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 font-medium",
                                  high && "text-red-600",
                                  low && "text-blue-600",
                                  !abnormal && "text-[var(--ink)]"
                                )}
                              >
                                {test.value}
                                {high && (
                                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                                {low && (
                                  <ArrowDown
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                )}
                                {abnormal && (
                                  <span className="sr-only">
                                    {high ? t.results.high : t.results.low}
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-[var(--ink-muted)]">
                              {test.unit ?? ""}
                            </td>
                            <td className="px-5 py-2.5 text-[var(--ink-muted)]">
                              {test.reference ?? ""}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            <footer className="border-t border-[var(--line)] p-5">
              {/*
                Stated on every report. A number outside its range is not a
                diagnosis, and a patient reading one alone at midnight should
                see that sentence next to it.
              */}
              <p className="flex items-start gap-2 text-xs text-[var(--ink-muted)]">
                <AlertCircle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                {t.results.disclaimer}
              </p>
            </footer>
          </article>
        )
      })}
    </div>
  )
}
