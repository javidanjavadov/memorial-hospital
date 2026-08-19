import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { contactInfo, getBranchName, telHref } from "@/data"
import {
  allCategorySlugs,
  DEFAULT_BRANCH,
  formatAzn,
  getCategory,
  getCategoryItems,
  getGroupCategories,
  GROUP_ORDER,
  priceOf,
  promotedPriceOf,
} from "@/lib/catalog"
import { pageMetadata } from "@/lib/site"

/**
 * One statically generated page per catalogue category.
 *
 * The catalogue is ~500KB, so it must never be handed to the browser whole.
 * Rendering a category per route keeps each page to its own rows and lets Next
 * prerender all of them at build time.
 */
export function generateStaticParams() {
  return allCategorySlugs().map((category) => ({ category }))
}

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const category = getCategory(slug)
  if (!category) return {}

  const items = getCategoryItems(slug)
  const from = items.length ? formatAzn(priceOf(items[0])) : ""

  return pageMetadata({
    title: `${category.name} — qiymətlər`,
    description: `Memorial Hospital ${category.name.toLowerCase()} — ${
      items.length
    } xidmət${from ? `, ${from}-dən başlayan qiymətlərlə` : ""}.`,
    path: `/xidmetler/${slug}`,
  })
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params
  const category = getCategory(slug)
  if (!category) notFound()

  const items = getCategoryItems(slug)
  const group = GROUP_ORDER.find((g) => g.slug === category.group)
  const siblings = getGroupCategories(category.group)

  /*
   * Long categories render as compact rows without descriptions.
   *
   * This is a readability call, not a performance one: "Spesifik Allergenlər"
   * has 224 items, and a paragraph under each turns the page into a wall of
   * near-identical boilerplate that is far harder to scan than a plain list.
   * (Page weight is a non-issue — the largest page is 626KB raw but 24KB
   * gzipped, since the repeated markup compresses ~96%.)
   */
  const compact = items.length > 40

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="border-b border-[var(--line)] bg-[var(--paper-raised)]">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Link
            href="/xidmetler"
            className="inline-flex items-center gap-2 text-sm text-[var(--ink-muted)] transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Bütün xidmətlər
          </Link>
          <p className="mt-4 text-sm uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            {group?.name ?? "Xidmətlər"}
          </p>
          <h1 className="font-display text-step-3 mt-2 text-[var(--ink)]">
            {category.name}
          </h1>
          <p className="mt-3 text-[var(--ink-muted)]">
            {items.length} xidmət · qiymətlər {getBranchName(DEFAULT_BRANCH)} üzrə
          </p>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[260px_1fr] md:py-14">
        {/* Sibling categories — the sidebar from the hospital's own catalogue */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-3 text-sm font-semibold text-[var(--ink)]">
            {group?.name ?? "Kateqoriyalar"}
          </h2>
          <nav aria-label="Kateqoriyalar">
            <ul className="space-y-1">
              {siblings.map((sibling) => {
                const active = sibling.slug === slug
                return (
                  <li key={sibling.slug}>
                    <Link
                      href={`/xidmetler/${sibling.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-[var(--ink-muted)] hover:bg-[var(--paper-raised)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {sibling.name}
                      </span>
                      <span className="shrink-0 text-xs opacity-70">
                        {sibling.count}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">
          <ul className="space-y-3">
            {items.map((item) => {
              const price = priceOf(item)
              const promoted = promotedPriceOf(item)
              const discounted = promoted !== null && promoted < price

              return (
                <li
                  key={item.slug}
                  className={`rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] ${
                    compact ? "px-5 py-3" : "p-5"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {item.code && (
                        <p className="font-mono text-xs text-[var(--ink-muted)]">
                          {item.code}
                        </p>
                      )}
                      <h3 className="mt-1 font-medium text-[var(--ink)]">
                        {item.name}
                      </h3>
                      {!compact && item.description && (
                        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                          {item.description}
                        </p>
                      )}
                      {item.prep && (
                        <p className={`inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)] ${compact ? "mt-1" : "mt-3"}`}>
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          Hazırlanma müddəti {item.prep}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      {discounted ? (
                        <>
                          <p className="text-sm text-[var(--ink-muted)] line-through">
                            {formatAzn(price)}
                          </p>
                          <p className="font-display text-step-1 text-primary">
                            {formatAzn(promoted)}
                          </p>
                          <p className="text-xs text-[var(--ink-muted)]">
                            onlayn qiymət
                          </p>
                        </>
                      ) : (
                        <p className="font-display text-step-1 text-primary">
                          {formatAzn(price)}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-6">
            <p className="text-[var(--ink-muted)]">
              Qiymətlər filiala görə dəyişə bilər. Analizə hazırlıq qaydaları və
              dəqiq qiymət üçün çağrı mərkəzimizlə əlaqə saxlayın.
            </p>
            <Button variant="cta" className="mt-4" asChild>
              <a href={telHref(contactInfo.phone)}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                {contactInfo.phone}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
