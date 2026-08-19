"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Home,
  Phone,
  ShoppingCart,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { branches, contactInfo, telHref } from "@/data"
import {
  basketSubtotal,
  HOME_COLLECTION_FEE,
  useBasketStore,
} from "@/lib/basket-store"
import type { BranchKey } from "@/lib/catalog"
import { controlClass } from "@/components/ui/field"

const formatAzn = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(2)} AZN`

export default function SebetPage() {
  const lines = useBasketStore((s) => s.lines)
  const branch = useBasketStore((s) => s.branch)
  const homeCollection = useBasketStore((s) => s.homeCollection)
  const hasHydrated = useBasketStore((s) => s.hasHydrated)
  const remove = useBasketStore((s) => s.remove)
  const clear = useBasketStore((s) => s.clear)
  const submitOrder = useBasketStore((s) => s.submit)
  const setBranch = useBasketStore((s) => s.setBranch)
  const setHomeCollection = useBasketStore((s) => s.setHomeCollection)

  const [sent, setSent] = useState(false)

  const subtotal = basketSubtotal(lines)
  const total = subtotal + (homeCollection ? HOME_COLLECTION_FEE : 0)
  const branchName =
    branches.find((b) => b.id === branch)?.name ?? branches[0].name

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status">
        <span className="text-[var(--ink-muted)]">Yüklənir...</span>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[var(--paper)] py-16">
        <div className="container mx-auto max-w-lg px-4 text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
            aria-hidden="true"
          >
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-display text-step-2 text-[var(--ink)]">
            Sifarişiniz qeydə alındı
          </h1>
          {/*
            No payment was taken and none is claimed. The order is a request the
            call centre confirms — saying anything stronger would leave someone
            believing they had paid.
          */}
          <p className="mt-4 text-[var(--ink-muted)]">
            Sifarişiniz qeydiyyata alındı. Operatorumuz sizinlə əlaqə saxlayaraq
            vaxtı və ödənişi təsdiqləyəcək. <strong>Onlayn ödəniş alınmadı</strong> —
            ödəniş klinikada və ya operatorun göndərdiyi keçidlə həyata keçirilir.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="cta" asChild>
              <Link href="/xidmetler">Xidmətlərə qayıt</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={telHref(contactInfo.phone)}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                {contactInfo.phone}
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-step-3 text-[var(--ink)]">Səbətim</h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          {lines.length} xidmət · qiymətlər {branchName} üzrə
        </p>

        {lines.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-10 text-center">
            <ShoppingCart
              className="mx-auto mb-4 h-12 w-12 text-[var(--ink-muted)]"
              aria-hidden="true"
            />
            <p className="text-[var(--ink-muted)]">Səbətiniz boşdur.</p>
            <Button variant="cta" className="mt-6" asChild>
              <Link href="/xidmetler">
                Xidmətlərə bax
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
            <ul className="space-y-3">
              {lines.map((line) => {
                const effective =
                  line.promoted != null && line.promoted < line.price
                    ? line.promoted
                    : line.price
                return (
                  <li
                    key={line.slug}
                    className="flex items-start justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-4"
                  >
                    <div className="min-w-0">
                      {line.code && (
                        <p className="font-mono text-xs text-[var(--ink-muted)]">
                          Kod: {line.code}
                        </p>
                      )}
                      <p className="mt-0.5 font-medium text-[var(--ink)]">
                        {line.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-display text-[var(--ink)]">
                        {formatAzn(effective)}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(line.slug)}
                        aria-label={`${line.name} səbətdən çıxar`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                )
              })}

              <li>
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm text-[var(--ink-muted)] underline-offset-4 hover:text-red-600 hover:underline"
                >
                  Səbəti təmizlə
                </button>
              </li>
            </ul>

            <aside className="h-fit rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-5">
              <label
                htmlFor="basket-branch"
                className="block text-sm font-medium text-[var(--ink)]"
              >
                Filial
              </label>
              <select
                id="basket-branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value as BranchKey)}
                className={`${controlClass} mt-2`}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-[var(--ink-muted)]">
                Qiymətlər filiala görə dəyişir.
              </p>

              <label className="mt-5 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={homeCollection}
                  onChange={(e) => setHomeCollection(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-teal-700"
                />
                <span className="text-sm text-[var(--ink)]">
                  <Home
                    className="mr-1 inline h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  Evdə qanalma xidməti
                  <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">
                    +{formatAzn(HOME_COLLECTION_FEE)}
                  </span>
                </span>
              </label>

              <dl className="mt-5 space-y-2 border-t border-[var(--line)] pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--ink-muted)]">Xidmətlər</dt>
                  <dd className="text-[var(--ink)]">{formatAzn(subtotal)}</dd>
                </div>
                {homeCollection && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--ink-muted)]">Qanalma xidməti</dt>
                    <dd className="text-[var(--ink)]">
                      {formatAzn(HOME_COLLECTION_FEE)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-[var(--line)] pt-2">
                  <dt className="font-medium text-[var(--ink)]">Ümumi</dt>
                  <dd className="font-display text-step-1 text-primary">
                    {formatAzn(total)}
                  </dd>
                </div>
              </dl>

              <Button
                variant="cta"
                size="lg"
                className="mt-5 w-full"
                onClick={() => {
                  // Moves the basket into order history rather than discarding
                  // it, so "Keçmiş sifarişlər" has something to show.
                  submitOrder()
                  setSent(true)
                }}
              >
                Sifarişi göndər
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>

              {/*
                Stated plainly rather than buried. The site cannot take payment —
                that needs a payment provider and a server — and a basket that
                looks like a checkout will otherwise be read as one.
              */}
              <p className="mt-3 flex items-start gap-2 text-xs text-[var(--ink-muted)]">
                <AlertCircle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                Onlayn ödəniş hələlik mövcud deyil. Sifariş göndərildikdən sonra
                operatorumuz zəng edərək vaxtı və ödənişi təsdiqləyir.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
