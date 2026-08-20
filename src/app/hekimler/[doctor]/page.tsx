import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseMedical,
  CalendarCheck,
  Clock,
  MapPin,
  Phone,
  Stethoscope,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import DoctorCard from "@/components/doctor-card"
import {
  contactInfo,
  doctors,
  getBranch,
  getDepartment,
  telHref,
  type Doctor,
} from "@/data"
import { pageMetadata, siteUrl } from "@/lib/site"
import { cn } from "@/lib/utils"
import { getDictionary } from "@/i18n"

type Props = { params: Promise<{ doctor: string }> }

export function generateStaticParams() {
  return doctors.map((doctor) => ({ doctor: doctor.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doctor: id } = await params
  const doctor = doctors.find((d) => d.id === id)
  if (!doctor) return {}

  const branch = getBranch(doctor.branchId)

  return pageMetadata({
    title: `${doctor.name} — ${doctor.specialty}`,
    description: `${doctor.name}, ${doctor.specialty}${
      doctor.title ? `, ${doctor.title}` : ""
    }. ${doctor.experience} il təcrübə, ${
      branch?.name ?? doctor.branch
    }. Onlayn qəbula yazılın.`,
    path: `/hekimler/${doctor.id}`,
  })
}

/**
 * One page per doctor.
 *
 * Statically generated from the same `doctors` array the listing reads, so a
 * doctor cannot appear on one and not the other.
 *
 * Everything here is published data — specialty, title, branch, years of
 * practice, consultation fee. Nothing is invented to fill the page out: a
 * biography or a list of qualifications the hospital has not published would be
 * a fabricated claim about a real person's credentials, which is worse than a
 * short page.
 */
export default async function DoctorPage({ params }: Props) {
  const t = await getDictionary()
  const { doctor: id } = await params
  const doctor = doctors.find((d) => d.id === id)
  if (!doctor) notFound()

  const branch = getBranch(doctor.branchId)
  const department = getDepartment(doctor.department)
  const bookable = doctor.available && doctor.price !== null

  /*
   * Same department first. Most departments here hold one or two doctors, so
   * without the branch fallback this section would simply be absent on the
   * majority of pages and the visitor would hit a dead end.
   */
  const sameDepartment = doctors.filter(
    (d) => d.id !== doctor.id && d.department === doctor.department && d.available
  )
  const sameBranch = doctors.filter(
    (d) => d.id !== doctor.id && d.branchId === doctor.branchId && d.available
  )
  const relatedByDepartment = sameDepartment.length > 0
  const colleagues = (relatedByDepartment ? sameDepartment : sameBranch).slice(0, 4)

  const facts = [
    { icon: Stethoscope, label: t.doctors.specialty, value: doctor.specialty },
    {
      icon: BriefcaseMedical,
      label: t.doctors.department,
      value: department?.name ?? doctor.department,
    },
    { icon: MapPin, label: t.doctors.branch, value: branch?.name ?? doctor.branch },
    { icon: Clock, label: t.doctors.experience, value: `${doctor.experience} il` },
  ]

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <StructuredDoctor doctor={doctor} />

      <div className="border-b border-[var(--line)] bg-[var(--paper-raised)]">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Link
            href="/hekimler"
            className="inline-flex items-center gap-2 text-sm text-[var(--ink-muted)] transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t.doctors.allDoctors}
          </Link>

          {/*
            Three columns on a wide screen: portrait, who they are, and the
            booking card. The price used to sit loose between two buttons, which
            read as a caption on the phone number next to it — the one number on
            the page a patient is actually deciding on.
          */}
          <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr_18rem] lg:items-start">
            <div className="relative mx-auto aspect-[4/5] w-44 overflow-hidden rounded-2xl bg-[var(--secondary)] ring-1 ring-[var(--line)] sm:w-52 lg:mx-0 lg:w-full">
              <Image
                src={doctor.image}
                alt={`${doctor.name}, ${doctor.specialty}`}
                fill
                sizes="(max-width: 640px) 11rem, (max-width: 1024px) 13rem, 220px"
                priority
                className="object-cover object-top"
              />
            </div>

            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
                <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
                {doctor.specialty}
              </span>

              <h1 className="font-display text-step-3 mt-3 text-[var(--ink)]">
                {doctor.name}
              </h1>

              {doctor.title && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)]">
                  {doctor.title}
                </p>
              )}

              {/* Boxed and divided rather than four floating icon rows, which
                  left the block looking unfinished against the portrait. */}
              <dl className="mt-6 grid divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)] sm:grid-cols-2 sm:divide-y-0">
                {facts.map((fact, index) => (
                  <div
                    key={fact.label}
                    className={cn(
                      "flex items-center gap-3 p-4",
                      index % 2 === 0 && "sm:border-r sm:border-[var(--line)]",
                      index < 2 && "sm:border-b sm:border-[var(--line)]"
                    )}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)]"
                      aria-hidden="true"
                    >
                      <fact.icon className="h-4.5 w-4.5 text-primary" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs text-[var(--ink-muted)]">
                        {fact.label}
                      </dt>
                      <dd className="truncate text-sm font-medium text-[var(--ink)]">
                        {fact.value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <aside className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5 lg:sticky lg:top-24">
              {bookable ? (
                <>
                  <p className="text-xs tracking-wide text-[var(--ink-muted)] uppercase">
                    Konsultasiya
                  </p>
                  <p className="font-display mt-1 text-step-2 text-[var(--ink)]">
                    {doctor.price}{" "}
                    <span className="text-step-0 text-[var(--ink-muted)]">AZN</span>
                  </p>
                  <Button variant="cta" size="lg" className="mt-4 w-full" asChild>
                    <Link href={`/qebul?doctor=${doctor.id}`}>
                      <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                      {t.home.bookButton}
                    </Link>
                  </Button>
                </>
              ) : (
                /*
                  Laboratory and imaging staff take no direct bookings — the
                  booking form's doctor list cannot contain them, so a button
                  here would lead nowhere.
                */
                <>
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {doctor.available
                      ? "Onlayn qəbul mövcud deyil"
                      : "Hazırda qəbul aparmır"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">
                    {t.doctors.callCentreNote}
                  </p>
                </>
              )}

              <Button variant="outline" className="mt-2 w-full" asChild>
                <a href={telHref(branch?.phone ?? contactInfo.phone)}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {branch?.phone ?? contactInfo.phone}
                </a>
              </Button>

              {branch && (
                <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-[var(--ink-muted)]">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {branch.address}
                </p>
              )}
            </aside>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 md:py-14">
        {branch && (
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-6">
            <h2 className="font-display text-step-1 text-[var(--ink)]">
              {t.doctors.appointmentPlace}
            </h2>
            <p className="mt-2 text-[var(--ink-muted)]">{branch.address}</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              {branch.workingHours}
            </p>
            <Link
              href={`/filiallar#${branch.id}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {t.doctors.aboutBranch}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        )}

        {colleagues.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-step-2 text-[var(--ink)]">
              {relatedByDepartment
                ? `${department?.name ?? "Şöbə"} üzrə digər həkimlər`
                : // The branch name already ends in "filialı", so no second one.
                  `${branch?.name ?? doctor.branch} üzrə digər həkimlər`}
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {colleagues.map((colleague) => (
                <li key={colleague.id} className="h-full">
                  <DoctorCard doctor={colleague} className="h-full" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

/** schema.org Physician, so the doctor can surface as a person, not a page. */
function StructuredDoctor({ doctor }: { doctor: Doctor }) {
  const branch = getBranch(doctor.branchId)
  const data = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    url: `${siteUrl}/hekimler/${doctor.id}`,
    image: `${siteUrl}${doctor.image}`,
    medicalSpecialty: doctor.specialty,
    jobTitle: doctor.title ?? doctor.specialty,
    worksFor: { "@type": "MedicalOrganization", name: "Memorial Hospital" },
    address: branch && {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressCountry: "AZ",
    },
    telephone: branch?.phone ?? contactInfo.phone,
  }

  return (
    <script
      type="application/ld+json"
      // Local data only, and `<` is escaped so the payload cannot close the
      // script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
