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
import ServiceInfoButton from "@/components/service-info-button"

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
          {/*
            A grid rather than one card per row. A category like Spesifik
            Allergenlər holds 224 tests, and stacked full-width each carried a
            short code, a short name and a price across the whole column — a
            very long page made almost entirely of empty space.

            The card stacks vertically now (code, name, prep, price) so it stays
            readable at a fifth of the width.
          */}
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {items.map((item) => {
              const price = priceOf(item)
              const promoted = promotedPriceOf(item)
              const discounted = promoted !== null && promoted < price

              return (
                <li
                  key={item.slug}
                  className="flex h-full flex-col rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-3"
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="font-mono text-[0.65rem] text-[var(--ink-muted)]">
                      {item.code}
                    </p>
                    <ServiceInfoButton
                      service={{
                        name: item.name,
                        code: item.code,
                        description: item.description,
                        prep: item.prep,
                        categoryName: item.categoryName,
                        prices: item.prices,
                      }}
                    />
                  </div>
                  <h3 className="mt-0.5 text-sm leading-snug font-medium text-[var(--ink)]">
                    {item.name}
                  </h3>

                  {/* Clamped to two lines: at a fifth of the width an unclamped
                      paragraph would set the row height for every sibling. */}
                  {!compact && item.description && (
                    <p className="mt-1 line-clamp-2 text-[0.7rem] leading-snug text-[var(--ink-muted)]">
                      {item.description}
                    </p>
                  )}

                  <div className="flex-1" />

                  {item.prep && (
                    <p className="mt-2 inline-flex items-start gap-1 text-[0.65rem] leading-tight text-[var(--ink-muted)]">
                      <Clock className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
                      {item.prep}
                    </p>
                  )}

                  <div className="mt-2 flex items-baseline gap-1.5 border-t border-[var(--line)] pt-2">
                    {discounted ? (
                      <>
                        <span className="font-display text-base text-primary">
                          {formatAzn(promoted)}
                        </span>
                        <span className="text-[0.65rem] text-[var(--ink-muted)] line-through">
                          {formatAzn(price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-display text-base text-primary">
                        {formatAzn(price)}
                      </span>
                    )}
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
