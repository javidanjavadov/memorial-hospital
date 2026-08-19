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
    { icon: Stethoscope, label: "İxtisas", value: doctor.specialty },
    {
      icon: BriefcaseMedical,
      label: "Şöbə",
      value: department?.name ?? doctor.department,
    },
    { icon: MapPin, label: "Filial", value: branch?.name ?? doctor.branch },
    { icon: Clock, label: "Təcrübə", value: `${doctor.experience} il` },
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
            Bütün həkimlər
          </Link>

          <div className="mt-6 grid gap-8 md:grid-cols-[240px_1fr] md:items-start">
            <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-2xl bg-[var(--secondary)] md:mx-0 md:w-full">
              <Image
                src={doctor.image}
                alt={`${doctor.name}, ${doctor.specialty}`}
                fill
                sizes="(max-width: 768px) 12rem, 240px"
                priority
                className="object-cover object-top"
              />
            </div>

            <div>
              <p className="text-sm tracking-[0.14em] text-[var(--ink-muted)] uppercase">
                {doctor.specialty}
              </p>
              <h1 className="font-display text-step-3 mt-2 text-[var(--ink)]">
                {doctor.name}
              </h1>
              {doctor.title && (
                <p className="mt-3 max-w-2xl leading-relaxed text-[var(--ink-muted)]">
                  {doctor.title}
                </p>
              )}

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-start gap-3">
                    <fact.icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="text-xs text-[var(--ink-muted)]">
                        {fact.label}
                      </dt>
                      <dd className="text-sm font-medium text-[var(--ink)]">
                        {fact.value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {bookable ? (
                  <>
                    <Button variant="cta" size="lg" asChild>
                      <Link href={`/qebul?doctor=${doctor.id}`}>
                        <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                        Qəbula yazıl
                      </Link>
                    </Button>
                    <p className="text-sm text-[var(--ink-muted)]">
                      Konsultasiya:{" "}
                      <span className="font-display text-step-1 text-primary">
                        {doctor.price} AZN
                      </span>
                    </p>
                  </>
                ) : (
                  /*
                    Laboratory and imaging staff take no direct bookings. A
                    button here would lead to a form whose doctor list cannot
                    contain them.
                  */
                  <div className="rounded-lg border border-[var(--line)] bg-[var(--secondary)] p-4">
                    <p className="text-sm text-[var(--ink)]">
                      {doctor.available
                        ? "Bu həkim üçün onlayn qəbul mövcud deyil."
                        : "Hazırda qəbul aparmır."}
                    </p>
                    <p className="mt-1 text-xs text-[var(--ink-muted)]">
                      Ətraflı məlumat üçün çağrı mərkəzimizlə əlaqə saxlayın.
                    </p>
                  </div>
                )}

                <Button variant="outline" size="lg" asChild>
                  <a href={telHref(branch?.phone ?? contactInfo.phone)}>
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {branch?.phone ?? contactInfo.phone}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 md:py-14">
        {branch && (
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-6">
            <h2 className="font-display text-step-1 text-[var(--ink)]">
              Qəbul yeri
            </h2>
            <p className="mt-2 text-[var(--ink-muted)]">{branch.address}</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              {branch.workingHours}
            </p>
            <Link
              href={`/filiallar#${branch.id}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Filial haqqında
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
