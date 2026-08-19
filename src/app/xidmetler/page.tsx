import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Home, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  contactInfo,
  departments,
  doctorsByDepartment,
  serviceCategories,
  telHref,
} from "@/data"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Xidmətlər",
  description:
    "Memorial Hospital xidmətləri — laboratoriya, poliklinika, həkim qəbulu, check-up müayinə və evdə xidmət.",
  path: "/xidmetler",
})

export default function XidmetlerPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-teal-700 uppercase">
            Xidmətlər
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Xidmətlərimiz
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Laboratoriya analizlərindən kompleks check-up müayinəyə qədər bütün
            tibbi xidmətlər üç filialımızda.
          </p>
        </div>
      </div>

      {/* Service groups */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((service) => (
            <section
              key={service.id}
              id={service.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white scroll-mt-28"
            >
              <div className="flex items-center justify-center bg-teal-50/60 px-6 py-8">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt=""
                    width={200}
                    height={188}
                    className="h-32 w-auto"
                  />
                ) : (
                  <Home className="h-24 w-24 text-teal-600" aria-hidden="true" />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  {service.name}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            İxtisaslar üzrə qəbul
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Həkim qəbulu {departments.length} ixtisas üzrə aparılır.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => {
              const count = doctorsByDepartment(dept.id).length
              return (
                <Link
                  key={dept.id}
                  id={dept.id}
                  href={`/hekimler?dept=${dept.id}`}
                  className="group flex items-start gap-4 rounded-xl border border-slate-200 p-5 transition-all duration-300 scroll-mt-28 hover:border-teal-300 hover:bg-teal-50/40"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700"
                    aria-hidden="true"
                  >
                    <dept.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-slate-900 transition-colors group-hover:text-teal-700">
                      {dept.name}
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {dept.description}
                    </span>
                    {count > 0 && (
                      <span className="mt-2 block text-xs font-medium text-teal-700">
                        {count} həkim
                      </span>
                    )}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA — prices are not listed here on purpose: the hospital publishes
          per-doctor consultation fees, which are shown on each doctor card. */}
      <div className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-14">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-teal-900 p-8 md:flex-row md:items-center md:p-10">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Hansı xidmətin sizə uyğun olduğunu bilmirsiniz?
              </h2>
              <p className="mt-2 text-teal-100">
                Reqistratura ilə əlaqə saxlayın — sizə uyğun həkimi təyin edək.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Button variant="cta" size="lg" asChild>
                <Link href="/qebul">
                  Qəbula yazıl
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <a href={telHref(contactInfo.phone)}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {contactInfo.phone}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
