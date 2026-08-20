import type { Metadata } from "next"
import Link from "next/link"
import { Phone, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { contactInfo, telHref } from "@/data"
import { catalogTotals, pickerGroups } from "@/lib/catalog"
import { pageMetadata } from "@/lib/site"
import ServicePicker from "@/components/service-picker"

export const metadata: Metadata = pageMetadata({
  title: "Xidmətlər və qiymətlər",
  description:
    "Memorial Hospital xidmətləri və qiymətləri — laboratoriya analizləri, USM, rentgen, tomoqrafiya və həkim qəbulu.",
  path: "/xidmetler",
})

export default function XidmetlerPage() {
  // Built on the server from the same catalogue the JSON files come from, so
  // the strip renders with the page instead of after a round trip.
  const groups = pickerGroups()

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="border-b border-[var(--line)] bg-[var(--paper-raised)]">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <p className="mb-3 text-sm uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            Xidmətlər
          </p>
          <h1 className="font-display text-step-4 max-w-3xl text-[var(--ink)]">
            Xidmətlər və qiymətlər
          </h1>
          <p className="mt-4 max-w-2xl text-step-0 text-[var(--ink-muted)]">
            {catalogTotals.items} analiz və müayinə, kateqoriyalar üzrə. Hər
            xidmətin kodu, hazırlanma müddəti və qiyməti göstərilib.
          </p>
        </div>
      </div>

      <div className="container mx-auto space-y-10 px-4 py-10 md:py-14">
        {/*
          The catalogue as an order-entry panel — group, category strip, then the
          services with the basket beside them. Browsing a list of category names
          and then landing on a separate page to add one test meant leaving and
          coming back for every item on a request form.

          Categories still have their own statically rendered pages: they are
          what search engines index and what a shared link opens.
        */}
        <ServicePicker groups={groups} />

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-6 md:p-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-step-1 text-[var(--ink)]">
                Axtardığınızı tapmadınız?
              </h2>
              <p className="mt-2 text-[var(--ink-muted)]">
                Çağrı mərkəzimiz analizin qiyməti və hazırlıq qaydaları barədə
                məlumat verir.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="cta" asChild>
                <a href={telHref(contactInfo.phone)}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {contactInfo.phone}
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/hekimler">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Həkim axtar
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
