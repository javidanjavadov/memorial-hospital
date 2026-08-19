import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Phone, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { contactInfo, telHref } from "@/data"
import {
  catalogTotals,
  formatAzn,
  getCategoryItems,
  getGroupCategories,
  GROUP_ORDER,
  priceOf,
} from "@/lib/catalog"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Xidmətlər və qiymətlər",
  description:
    "Memorial Hospital xidmətləri və qiymətləri — laboratoriya analizləri, USM, rentgen, tomoqrafiya və həkim qəbulu.",
  path: "/xidmetler",
})

/** Cheapest item in a category, so each card can show a "from" price. */
function fromPrice(slug: string) {
  const items = getCategoryItems(slug)
  return items.length ? priceOf(items[0]) : null
}

export default function XidmetlerPage() {
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

      <div className="container mx-auto space-y-16 px-4 py-14 md:py-20">
        {GROUP_ORDER.map((group) => {
          const categories = getGroupCategories(group.slug)
          if (!categories.length) return null

          return (
            <section key={group.slug} id={group.slug}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-step-2 text-[var(--ink)]">
                    {group.name}
                  </h2>
                  <p className="mt-1 text-[var(--ink-muted)]">{group.blurb}</p>
                </div>
                <p className="text-sm text-[var(--ink-muted)]">
                  {categories.reduce((n, c) => n + c.count, 0)} xidmət ·{" "}
                  {categories.length} kateqoriya
                </p>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => {
                  const from = fromPrice(category.slug)
                  return (
                    <li key={category.slug}>
                      <Link
                        href={`/xidmetler/${category.slug}`}
                        className="group flex h-full flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-5 transition-colors hover:border-primary/40"
                      >
                        <div>
                          <h3 className="font-medium text-[var(--ink)] group-hover:text-primary">
                            {category.name}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--ink-muted)]">
                            {category.count} xidmət
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          {from !== null && (
                            <span className="text-sm text-[var(--ink-muted)]">
                              <span className="font-semibold text-primary">
                                {formatAzn(from)}
                              </span>
                              -dən
                            </span>
                          )}
                          <ArrowRight
                            className="h-4 w-4 text-[var(--ink-muted)] transition-transform group-hover:translate-x-1 group-hover:text-primary"
                            aria-hidden="true"
                          />
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}

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
