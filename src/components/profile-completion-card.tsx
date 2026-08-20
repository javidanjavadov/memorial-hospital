"use client"

import Link from "next/link"
import { ArrowRight, Check, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  REQUIRED_PROFILE_FIELDS,
  type ProfileField,
} from "@/lib/profile-complete"
import { cn } from "@/lib/utils"
import { useT } from "@/i18n/client"

/**
 * How far the profile is from usable.
 *
 * Shows what is DONE as well as what is missing, with a count and a bar. A flat
 * list of six field names under a warning read as six separate failures — the
 * same six fields, framed as progress, are two minutes of typing. That matters
 * here because the visitor cannot order or book until this is finished, so the
 * card has to invite rather than scold.
 *
 * `next` turns the button into a return trip: fill this in, land back where you
 * were going.
 */
export default function ProfileCompletionCard({
  missing,
  next,
  reason,
  compact = false,
  className,
}: {
  missing: ProfileField[]
  next?: string
  reason?: string
  /** Sits inside a basket column or a form step rather than across a page. */
  compact?: boolean
  className?: string
}) {
  const t = useT()
  const total = REQUIRED_PROFILE_FIELDS.length
  const done = total - missing.length
  const missingKeys = new Set(missing.map((field) => field.key))

  return (
    <section
      aria-label="{t.ui.profileCompletionEyebrow}"
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)]",
        className
      )}
    >
      {/* Progress as a hairline across the top: present, but not an alarm. */}
      <div className="h-1 w-full bg-[var(--secondary)]">
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>

      <div className={cn("p-5", !compact && "md:p-6")}>
        <div className="flex items-start gap-4">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10"
            aria-hidden="true"
          >
            <UserCog className="h-5 w-5 text-primary" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                className={cn(
                  "font-display text-[var(--ink)]",
                  compact ? "text-base" : "text-step-1"
                )}
              >
                {t.ui.profileCompletionTitle}
              </h2>
              <span className="rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--ink-muted)]">
                {done}/{total}
              </span>
            </div>

            <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-muted)]">
              {reason ??
                "{t.ui.profileCompletionBody}"}
            </p>

            {/*
              Every field, ticked or not — so the visitor sees the end of the
              list, not just the part they have failed.
            */}
            <ul className="mt-4 flex flex-wrap gap-2">
              {REQUIRED_PROFILE_FIELDS.map((field) => {
                const pending = missingKeys.has(field.key)
                return (
                  <li
                    key={field.key}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                      pending
                        ? "border-dashed border-[var(--ink-muted)]/40 text-[var(--ink-muted)]"
                        : "border-primary/30 bg-primary/5 font-medium text-primary"
                    )}
                  >
                    {pending ? (
                      <span
                        className="h-3 w-3 rounded-full border border-current opacity-50"
                        aria-hidden="true"
                      />
                    ) : (
                      <Check className="h-3 w-3" aria-hidden="true" />
                    )}
                    {t.profile[field.label]}
                    <span className="sr-only">
                      {pending ? " — doldurulmayıb" : " — tamamlanıb"}
                    </span>
                  </li>
                )
              })}
            </ul>

            {next && (
              <Button variant="cta" className="mt-5 w-full sm:w-auto" asChild>
                <Link href={`/profil?next=${encodeURIComponent(next)}`}>
                  {t.ui.fillDetails}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
