"use client"

import Link from "next/link"
import { ordersFor, useBasketStore } from "@/lib/basket-store"
import { useCurrentUser } from "@/lib/use-current-user"
import { cn } from "@/lib/utils"
import { useT } from "@/i18n/client"

/** dd.MM.yyyy — see the note in src/app/profil/page.tsx on az-AZ formatting. */
const formatDate = (iso: string) => {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

/**
 * Who the order is being placed for, the way the hospital's own panel heads an
 * order with the patient.
 *
 * Shown while choosing services as well as in the basket: on a shared computer
 * — a family, a reception desk — an avatar in the corner is the only thing
 * distinguishing one patient's tests from another's, and the moment to catch
 * that is before the sample is taken, not after.
 *
 * Renders nothing when signed out; the visitor is choosing for nobody in
 * particular yet.
 */
export default function PatientHeader({ className }: { className?: string }) {
  const t = useT()
  const { user } = useCurrentUser()
  const orders = useBasketStore((s) => s.orders)
  const hasHydrated = useBasketStore((s) => s.hasHydrated)

  if (!user) return null

  const orderCount = hasHydrated ? ordersFor(orders, user.id).length : 0
  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-4",
        className
      )}
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-bold text-white"
        aria-hidden="true"
      >
        {initials}
      </span>

      <div className="min-w-0">
        <p className="font-medium uppercase text-[var(--ink)]">{user.fullName}</p>
        <dl className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ink-muted)]">
          {user.birthDate && (
            <div className="flex gap-1">
              <dt>{t.profile.birthDate}:</dt>
              <dd className="font-medium text-[var(--ink)]">
                {formatDate(user.birthDate)}
              </dd>
            </div>
          )}
          <div className="flex gap-1">
            <dt className="sr-only">{t.profile.gender}</dt>
            <dd>{user.gender === "FEMALE" ? t.profile.female : t.profile.male}</dd>
          </div>
          {user.finCode && (
            <div className="flex gap-1">
              <dt>FIN:</dt>
              <dd className="font-mono font-medium text-[var(--ink)]">
                {user.finCode}
              </dd>
            </div>
          )}
          <div className="flex gap-1">
            <dt>{t.profile.orderCount}:</dt>
            <dd className="font-medium text-[var(--ink)]">{orderCount}</dd>
          </div>
        </dl>
      </div>

      <Link
        href="/profil"
        className="ml-auto text-sm font-medium text-primary hover:underline"
      >
        Profil
      </Link>
    </div>
  )
}
