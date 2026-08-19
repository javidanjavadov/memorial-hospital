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
        "group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-teal-300 hover:shadow-[0_12px_32px_-12px_rgba(24,56,62,0.25)]",
        className
      )}
    >
      <div className="relative aspect-4/5 overflow-hidden bg-slate-100">
        <Image
          src={doctor.image}
          alt={`${doctor.name}, ${doctor.specialty}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Specialty sits on the image so the text block below stays uncluttered. */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal-950/85 to-transparent p-4 pt-10">
          <p className="text-sm font-medium text-white/95">{doctor.specialty}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-base leading-snug font-semibold text-slate-900">
            {doctor.name}
          </h3>
          {doctor.title && (
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {doctor.title}
            </p>
          )}
        </div>

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Filial</dt>
            <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <dd>{doctor.branch}</dd>
          </div>
          <div>
            <dt className="sr-only">Təcrübə</dt>
            <dd>{doctor.experience} il təcrübə</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {doctor.price !== null ? (
            <p className="text-sm font-semibold text-slate-900">
              {doctor.price} <span className="font-normal text-slate-500">AZN</span>
            </p>
          ) : (
            <p className="text-xs text-slate-500">Laboratoriya heyəti</p>
          )}

          {bookable && (
            <Link
              href={`/qebul?doctor=${doctor.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50"
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
