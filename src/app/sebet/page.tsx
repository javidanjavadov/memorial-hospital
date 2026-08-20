"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CheckCircle,
  CreditCard,
  Home,
  ListPlus,
  LogIn,
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
import type { PaymentMethod } from "@/lib/basket-store"
import { useCurrentUser } from "@/lib/use-current-user"
import PatientHeader from "@/components/patient-header"
import { missingProfileFields } from "@/lib/profile-complete"
import ProfileCompletionCard from "@/components/profile-completion-card"
import { shortServiceName } from "@/lib/service-name"
import { controlClass } from "@/components/ui/field"
import { useT } from "@/i18n/client"

const formatAzn = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(2)} AZN`

export default function SebetPage() {
  const t = useT()
  const lines = useBasketStore((s) => s.lines)
  const branch = useBasketStore((s) => s.branch)
  const homeCollection = useBasketStore((s) => s.homeCollection)
  const hasHydrated = useBasketStore((s) => s.hasHydrated)
  const remove = useBasketStore((s) => s.remove)
  const clear = useBasketStore((s) => s.clear)
  const submitOrder = useBasketStore((s) => s.submit)
  const setBranch = useBasketStore((s) => s.setBranch)
  const setHomeCollection = useBasketStore((s) => s.setHomeCollection)
  const paymentMethod = useBasketStore((s) => s.paymentMethod)
  const setPaymentMethod = useBasketStore((s) => s.setPaymentMethod)

  // An order has to be attached to a patient — the lab needs to know whose
  // sample it is, and the results have to reach someone.
  const { user, isLoading } = useCurrentUser()
  const missing = missingProfileFields(user)

  /*
   * The outcome of the submit, not merely "the button was pressed". `delivered`
   * says whether the hospital actually received it; the confirmation screen has
   * to tell the truth either way, because the difference decides whether the
   * patient needs to pick up the phone.
   */
  const [sent, setSent] = useState<
    { reference: string; delivered: boolean } | null
  >(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")


  const subtotal = basketSubtotal(lines)
  const total = subtotal + (homeCollection ? HOME_COLLECTION_FEE : 0)
  const branchName =
    branches.find((b) => b.id === branch)?.name ?? branches[0].name

  if (!hasHydrated || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status">
        <span className="text-[var(--ink-muted)]">{t.common.loading}</span>
      </div>
    )
  }

  const placeOrder = async () => {
    if (!user) return

    setSubmitError("")
    setSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch,
          homeCollection,
          paymentMethod,
          quotedTotal: total,
          lines: lines.map((line) => ({
            slug: line.slug,
            name: line.name,
            code: line.code ?? "",
            quotedPrice:
              line.promoted != null && line.promoted < line.price
                ? line.promoted
                : line.price,
          })),
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload?.ok) {
        /*
         * The basket is deliberately NOT emptied on failure. Rebuilding thirty
         * tests by hand is how someone gives up and phones a competitor.
         */
        setSubmitError(
          payload?.error ?? t.basket.submitFailed
        )
        return
      }

      // Only now moves it into history, so a failed send cannot leave a record
      // of an order that was never placed.
      submitOrder(user.id)
      setSent({ reference: payload.reference, delivered: payload.delivered })
    } catch {
      setSubmitError(t.common.networkError)
    } finally {
      setSubmitting(false)
    }
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
            {t.basket.orderPlaced}
          </h1>
          <p className="mt-2 font-mono text-sm text-[var(--ink-muted)]">
            {sent.reference}
          </p>

          {/*
            Two different truths, and the wording follows whichever one applies.
            Promising a call back when no endpoint is configured is what leaves
            someone waiting at home for one nobody was told to make.
          */}
          <p className="mt-4 text-[var(--ink-muted)]">
            {sent.delivered ? (
              <>
{t.basket.orderDelivered}
              </>
            ) : (
              <>
{t.basket.orderStoredOnly}
              </>
            )}{" "}
            <strong>{t.basket.noPaymentTaken}</strong>; {t.basket.paymentAtClinic}.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="cta" asChild>
              <Link href="/xidmetler">{t.basket.backToServices}</Link>
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
        <h1 className="font-display text-step-3 text-[var(--ink)]">{t.basket.title}</h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          {lines.length} xidmət · qiymətlər {branchName} üzrə
        </p>

        <PatientHeader className="mt-6" />

        {lines.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-10 text-center">
            <ShoppingCart
              className="mx-auto mb-4 h-12 w-12 text-[var(--ink-muted)]"
              aria-hidden="true"
            />
            <p className="text-[var(--ink-muted)]">{t.basket.empty}</p>
            <Button variant="cta" className="mt-6" asChild>
              <Link href="/xidmetler">
                {t.profile.browseServices}
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
                    className="line-in flex items-start justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-4"
                  >
                    <div className="min-w-0">
                      {line.code && (
                        <p className="font-mono text-xs text-[var(--ink-muted)]">
                          {t.catalog.code}: {line.code}
                        </p>
                      )}
                      <p
                        title={line.name}
                        className="mt-0.5 font-medium text-[var(--ink)]"
                      >
                        {shortServiceName(line.name)}
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

              <li className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/xidmetler#laboratory-catalog">
                    <ListPlus className="h-4 w-4" aria-hidden="true" />
                    {t.basket.addService}
                  </Link>
                </Button>
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm text-[var(--ink-muted)] underline-offset-4 hover:text-red-600 hover:underline"
                >
                  {t.basket.clearBasket}
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
                {t.basket.branchPricesVary}
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
                  {t.basket.homeCollection}
                  <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">
                    +{formatAzn(HOME_COLLECTION_FEE)}
                  </span>
                </span>
              </label>

              <fieldset className="mt-5">
                <legend className="text-sm font-medium text-[var(--ink)]">
                  {t.basket.paymentMethod}
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "CASH", label: t.basket.cash, icon: Banknote },
                      { id: "CARD", label: t.basket.card, icon: CreditCard },
                    ] as const
                  ).map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        paymentMethod === option.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-[var(--line)] text-[var(--ink-muted)] hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.id}
                        checked={paymentMethod === option.id}
                        onChange={() => setPaymentMethod(option.id as PaymentMethod)}
                        className="sr-only"
                      />
                      <option.icon className="h-4 w-4" aria-hidden="true" />
                      {option.label}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[var(--ink-muted)]">
{t.basket.paymentAtBranch}
                </p>
              </fieldset>

              <dl className="mt-5 space-y-2 border-t border-[var(--line)] pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--ink-muted)]">{t.basket.services}</dt>
                  <dd className="text-[var(--ink)]">{formatAzn(subtotal)}</dd>
                </div>
                {homeCollection && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--ink-muted)]">{t.basket.collectionFee}</dt>
                    <dd className="text-[var(--ink)]">
                      {formatAzn(HOME_COLLECTION_FEE)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-[var(--line)] pt-2">
                  <dt className="font-medium text-[var(--ink)]">{t.basket.total}</dt>
                  <dd className="font-display text-step-1 text-primary">
                    {formatAzn(total)}
                  </dd>
                </div>
              </dl>

              {user && missing.length > 0 ? (
                <div className="mt-5">
                  <ProfileCompletionCard compact
                    missing={missing}
                    next="/sebet"
                    reason={t.basket.signInReason}
                  />
                </div>
              ) : user ? (
                <>
                  {submitError && (
                    <p
                      role="alert"
                      className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                      <AlertCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      {submitError}
                    </p>
                  )}
                  <Button
                    variant="cta"
                    size="lg"
                    className="mt-5 w-full"
                    disabled={submitting}
                    onClick={placeOrder}
                  >
                    {submitting ? "{t.basket.submitting}" : "{t.basket.submitOrder}"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </>
              ) : (
                /*
                  Signed out, the basket is kept and the order is blocked rather
                  than the page being closed off: the visitor can still price
                  everything up, and the basket persists through the round trip
                  to /giris and back.
                */
                <div className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--secondary)] p-4">
                  <p className="text-sm text-[var(--ink)]">
                    {t.basket.signInToOrder}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">
{t.basket.signInReason}
                  </p>
                  <Button variant="cta" size="lg" className="mt-3 w-full" asChild>
                    <Link href="/giris?next=/sebet">
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      Daxil ol
                    </Link>
                  </Button>
                  <Button variant="outline" className="mt-2 w-full" asChild>
                    <Link href="/qeydiyyat">{t.auth.signUpTitle}</Link>
                  </Button>
                </div>
              )}

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
{t.basket.noOnlinePayment}
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
