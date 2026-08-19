"use client"

import { useRef } from "react"
import { Clock, Info, Phone, X } from "lucide-react"
import { branches, contactInfo, telHref } from "@/data"

export interface ServiceInfo {
  name: string
  code?: string
  description?: string
  prep?: string
  categoryName?: string
  prices?: Record<string, { price: number; promoted?: number | null }>
}

const formatAzn = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(2)} AZN`

/**
 * Per-test detail, behind a small button on each card.
 *
 * A native <dialog> rather than a hand-rolled overlay: `showModal()` brings
 * focus trapping, Escape to close, inertness of the page behind it and a
 * ::backdrop, none of which we would otherwise get without a dependency.
 *
 * The prices table is the reason this is worth opening. The listing shows one
 * branch's price only — the header says as much — so until now there was no way
 * to see that the same test costs something different in Ganja.
 */
export default function ServiceInfoButton({ service }: { service: ServiceInfo }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={`${service.name} haqqında ətraflı`}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--ink-muted)] transition-colors hover:bg-primary/10 hover:text-primary"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        // Clicking the backdrop closes it. The check compares against the
        // dialog itself, which is the event target only for backdrop clicks —
        // clicks inside land on a child.
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close()
        }}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-0 backdrop:bg-black/50"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {service.code && (
                <p className="font-mono text-xs text-[var(--ink-muted)]">
                  {service.code}
                </p>
              )}
              <h2 className="font-display mt-1 text-step-1 text-[var(--ink)]">
                {service.name}
              </h2>
              {service.categoryName && (
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  {service.categoryName}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Bağla"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--ink-muted)] transition-colors hover:bg-[var(--secondary)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {service.description && (
            <p className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)]">
              {service.description}
            </p>
          )}

          {service.prep && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--secondary)] px-3 py-2 text-sm text-[var(--ink)]">
              <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
              Hazırlanma müddəti: {service.prep}
            </p>
          )}

          {service.prices && (
            <div className="mt-5">
              <h3 className="text-xs tracking-[0.14em] text-[var(--ink-muted)] uppercase">
                Filiallar üzrə qiymət
              </h3>
              <ul className="mt-2 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {branches.map((branch) => {
                  const entry = service.prices?.[branch.id]
                  if (!entry) return null
                  const discounted =
                    entry.promoted != null && entry.promoted < entry.price
                  return (
                    <li
                      key={branch.id}
                      className="flex items-baseline justify-between gap-4 py-2"
                    >
                      <span className="text-sm text-[var(--ink)]">
                        {branch.name}
                      </span>
                      <span className="flex items-baseline gap-2">
                        {discounted && (
                          <span className="text-xs text-[var(--ink-muted)] line-through">
                            {formatAzn(entry.price)}
                          </span>
                        )}
                        <span className="font-display text-base text-primary">
                          {formatAzn(
                            discounted ? (entry.promoted as number) : entry.price
                          )}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-2 text-xs text-[var(--ink-muted)]">
                Endirimli qiymət onlayn sifariş üçün keçərlidir.
              </p>
            </div>
          )}

          <a
            href={telHref(contactInfo.phone)}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Hazırlıq qaydaları üçün {contactInfo.phone}
          </a>
        </div>
      </dialog>
    </>
  )
}
