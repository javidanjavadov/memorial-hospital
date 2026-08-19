"use client"

import { useState, type ReactNode } from "react"
import { History, ListPlus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { branches } from "@/data"
import { ordersFor, useBasketStore } from "@/lib/basket-store"
import { shortServiceName } from "@/lib/service-name"
import { useCurrentUser } from "@/lib/use-current-user"
import { cn } from "@/lib/utils"

/**
 * dd.MM.yyyy, written out rather than left to toLocaleDateString("az-AZ").
 * Not every engine ships an Azerbaijani calendar format, and the ones that do
 * not fall back to "2026 M08 20" — which is not a date anyone here reads.
 */
const formatDate = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

const formatAzn = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(2)} AZN`

/**
 * "Xidmət seçimi" / "Keçmiş sifarişlər", mirroring the hospital's order-entry
 * panel.
 *
 * Past orders come from this browser's own storage, so the tab is honest about
 * being local rather than implying a synced account history — there is no
 * backend holding orders yet.
 *
 * The catalogue itself stays a Server Component: it is passed in as children so
 * 224 statically rendered cards do not become client-rendered just to put a tab
 * strip above them.
 */
export default function CatalogTabs({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<"services" | "orders">("services")
  const allOrders = useBasketStore((s) => s.orders)
  const { user } = useCurrentUser()
  const orders = ordersFor(allOrders, user?.id)
  const hasHydrated = useBasketStore((s) => s.hasHydrated)
  const reorder = useBasketStore((s) => s.reorder)

  const orderCount = hasHydrated ? orders.length : 0

  return (
    <div>
      <div
        role="tablist"
        aria-label="Kataloq görünüşü"
        className="mb-6 flex gap-6 border-b border-[var(--line)]"
      >
        {(
          [
            { id: "services", label: "Xidmət seçimi", icon: ListPlus },
            { id: "orders", label: "Keçmiş sifarişlər", icon: History },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "-mb-px inline-flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
              tab === item.id
                ? "border-primary text-primary"
                : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
            {item.id === "orders" && orderCount > 0 && (
              <span className="rounded-full bg-[var(--secondary)] px-1.5 text-xs text-[var(--ink)]">
                {orderCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div hidden={tab !== "services"}>{children}</div>

      {tab === "orders" && (
        <div>
          {orderCount === 0 ? (
            <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-10 text-center">
              <History
                className="mx-auto mb-3 h-10 w-10 text-[var(--ink-muted)]"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-[var(--ink)]">
                Hələ sifarişiniz yoxdur
              </p>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">
                Göndərdiyiniz sifarişlər burada saxlanılır.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => {
                const branchName =
                  branches.find((b) => b.id === order.branch)?.name ??
                  order.branch
                return (
                  <li
                    key={order.id}
                    className="rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--ink)]">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                          {branchName} · {order.lines.length} xidmət
                          {order.homeCollection && " · evdə qanalma"}
                          {order.paymentMethod === "CARD" ? " · kart" : " · nağd"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-[var(--ink)]">
                          {formatAzn(order.total)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            reorder(order.id)
                            setTab("services")
                          }}
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          Təkrarla
                        </Button>
                      </div>
                    </div>

                    <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--line)] pt-3">
                      {order.lines.map((line) => (
                        <li
                          key={line.slug}
                          className="rounded-md bg-[var(--secondary)] px-2 py-1 text-xs text-[var(--ink)]"
                        >
                          {shortServiceName(line.name)}
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          )}

          <p className="mt-4 text-xs text-[var(--ink-muted)]">
            Sifariş tarixçəsi yalnız bu brauzerdə saxlanılır. Tam siyahı üçün
            profilinizin “Sifarişlərim” bölməsinə baxın.
          </p>
        </div>
      )}
    </div>
  )
}
