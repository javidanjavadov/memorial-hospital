"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Award, BriefcaseBusiness, MapPin, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Doctor } from "@/data"
import { useT } from "@/i18n/client"
import { branchShortName, localizeDoctor } from "@/i18n/data"

/**
 * Single doctor card, shared by the homepage strip and the /hekimler grid so
 * the two can never drift apart visually.
 *
 * Compact and horizontal, and the profile page it used to link to is gone — so
 * this card is not a preview of a second screen any more, it is the whole
 * entry. That is why it carries the facts someone actually picks a doctor on
 * rather than only a name: specialty, years of practice, branch and fee, plus
 * the published title where the hospital has one.
 *
 * The whole card is the booking link. With no profile to compete for the click
 * there is only one thing to do here, so the target is the card rather than a
 * small link inside it.
 */
export default function DoctorCard({
  doctor: raw,
  priority = false,
  className,
}: {
  doctor: Doctor
  /** Set on the first few above-the-fold cards to preload their images. */
  priority?: boolean
  className?: string
}) {
  const t = useT()
  const doctor = localizeDoctor(raw, t.data)
  const bookable = doctor.available && doctor.price !== null

  return (
    <article
      className={cn(
        "group relative flex items-start gap-4 rounded-xl bg-white p-4 ring-1 ring-[var(--line)] transition-colors duration-300",
        bookable && "hover:ring-[var(--ink)]/25",
        !doctor.available && "opacity-75",
        className
      )}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--secondary)]">
        <Image
          src={doctor.image}
          alt={`${doctor.name}, ${doctor.specialty}`}
          fill
          /* Fixed 80px box at every breakpoint, so the browser is told that
             rather than being left to download a full-width image for it. */
          sizes="80px"
          priority={priority}
          className="object-cover object-top"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-[0.6875rem] uppercase tracking-wide text-[var(--ink-muted)]">
          {doctor.specialty}
        </p>

        <h3 className="font-display text-sm leading-snug text-[var(--ink)]">
          {bookable ? (
            /* Stretched link: the card is the target, not this line of text. */
            <Link
              href={`/qebul?doctor=${doctor.id}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {doctor.name}
            </Link>
          ) : (
            doctor.name
          )}
        </h3>

        {/*
          Only one doctor in the roster has a published title, so this is the
          exception rather than a row every card reserves space for. Clamped to
          two lines: the one that exists runs to eleven words.
        */}
        {doctor.title && (
          <p className="flex items-start gap-1.5 text-xs leading-snug text-[var(--ink-muted)]">
            <Award
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--primary)] opacity-70"
              aria-hidden="true"
            />
            <span className="line-clamp-2">{doctor.title}</span>
          </p>
        )}

        <dl className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--ink-muted)]">
          <div className="flex items-center gap-1">
            <dt className="sr-only">{t.doctors.branch}</dt>
            <MapPin className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            <dd>{branchShortName(doctor.branchId, doctor.branch, t.data)}</dd>
          </div>

          {/* Plural-aware: Russian needs three forms of "year". */}
          <div className="flex items-center gap-1">
            <dt className="sr-only">{t.doctors.experience}</dt>
            <BriefcaseBusiness className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            <dd>{t.n(t.doctors.years, doctor.experience)}</dd>
          </div>

          {doctor.price !== null && (
            <div className="flex items-center gap-1">
              <dt className="sr-only">{t.doctors.consultation}</dt>
              <Wallet className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
              <dd className="font-medium text-[var(--ink)]">
                {doctor.price} AZN
              </dd>
            </div>
          )}
        </dl>

        {/*
          Said plainly rather than left to a greyed-out card. Someone scanning
          for an appointment needs to know this doctor is not an option before
          they click, not after.
        */}
        {!doctor.available ? (
          <p className="mt-1 inline-flex w-fit rounded-md bg-[var(--secondary)] px-2 py-0.5 text-[0.6875rem] font-medium text-[var(--ink-muted)]">
            {t.doctors.notAccepting}
          </p>
        ) : (
          doctor.price === null && (
            <p className="mt-1 inline-flex w-fit rounded-md bg-[var(--secondary)] px-2 py-0.5 text-[0.6875rem] font-medium text-[var(--ink-muted)]">
              {t.ui.labStaff}
            </p>
          )
        )}
      </div>

      {bookable && (
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-lg text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white"
          aria-hidden="true"
        >
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </article>
  )
}
