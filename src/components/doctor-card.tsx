import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Doctor } from "@/data"

/**
 * Single doctor card, shared by the homepage strip and the /hekimler grid so
 * the two can never drift apart visually.
 *
 * Photography carries the card, so the chrome around it stays quiet: a hairline
 * border, no gradient, and shadow only on hover. The previous version rendered
 * initials in a gradient circle because no photos existed.
 */
export default function DoctorCard({
  doctor,
  priority = false,
  className,
}: {
  doctor: Doctor
  /** Set on the first few above-the-fold cards to preload their images. */
  priority?: boolean
  className?: string
}) {
  const bookable = doctor.available && doctor.price !== null

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-[var(--line)] transition-colors duration-300 hover:ring-[var(--ink)]/25",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--secondary)]">
        <Image
          src={doctor.image}
          alt={`${doctor.name}, ${doctor.specialty}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="mb-1.5 text-xs tracking-wide text-[var(--ink-muted)] uppercase">
            {doctor.specialty}
          </p>
          <h3 className="font-display text-base leading-snug text-[var(--ink)]">
            {doctor.name}
          </h3>
          {doctor.title && (
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-muted)]">
              {doctor.title}
            </p>
          )}
        </div>

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--ink-muted)]">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Filial</dt>
            <MapPin className="h-4 w-4 opacity-60" aria-hidden="true" />
            <dd>{doctor.branch}</dd>
          </div>
          <div>
            <dt className="sr-only">Təcrübə</dt>
            <dd>{doctor.experience} il təcrübə</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
          {doctor.price !== null ? (
            <p className="text-sm font-medium text-[var(--ink)]">
              {doctor.price} <span className="text-[var(--ink-muted)]">AZN</span>
            </p>
          ) : (
            <p className="text-xs text-[var(--ink-muted)]">Laboratoriya heyəti</p>
          )}

          {bookable && (
            <Link
              href={`/qebul?doctor=${doctor.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] transition-colors hover:text-[var(--ink)]"
            >
              Qəbul
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
