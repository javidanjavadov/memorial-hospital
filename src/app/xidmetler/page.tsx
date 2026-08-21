import type { Metadata } from "next"
import Link from "next/link"
import { Phone, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { contactInfo, telHref } from "@/data"
import { catalogTotals, pickerGroups } from "@/lib/catalog"
import { pageMetadata } from "@/lib/site"
import ServicePicker from "@/components/service-picker"
import { getDictionary, getLocale } from "@/i18n"
import { fill } from "@/i18n/format"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary()
  return pageMetadata({
    title: t.ui.servicesPageTitle,
    description: t.ui.servicesPageDescription,
    path: "/xidmetler",
  })
}

export default async function XidmetlerPage() {
  const t = await getDictionary()
  // Built on the server from the same catalogue the JSON files come from, so
  // the strip renders with the page instead of after a round trip.
  const groups = pickerGroups(await getLocale())

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/*
        The hero is gone: this page is an order-entry panel, and a full screen
        of title before it pushed the thing people came for below the fold.

        The heading itself stays, read out rather than drawn. A page with no
        h1 has no name in a screen reader's landmark list and none in a search
        result, and the intro line is what the catalogue's snippet is built
        from — deleting the markup would have cost both to hide a banner.
      */}
      <h1 className="sr-only">{t.catalog.title}</h1>
      <p className="sr-only">
        {fill(t.catalog.pageIntro, { count: catalogTotals.items })}
      </p>

      <div className="container mx-auto space-y-10 px-4 py-6 md:py-8">
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
                {t.ui.notFoundWhatYouNeed}
              </h2>
              <p className="mt-2 text-[var(--ink-muted)]">
{t.ui.callCentreInfo}
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
                  {t.ui.findDoctor}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
