"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, Globe, Loader2 } from "lucide-react"
import { useLocale } from "@/i18n/client"
import {
  locales,
  localeNames,
  localeShortNames,
  type Locale,
} from "@/i18n/config"
import { cn } from "@/lib/utils"

/**
 * Language switcher.
 *
 * The choice is stored server-side as a cookie and the route is refreshed, so
 * the next render — including every Server Component — comes back in the new
 * language. Translating in the browser instead would leave the server-rendered
 * HTML in Azerbaijani and flash it before the switch.
 */
export default function LanguageSwitcher({
  overHero,
  className,
}: {
  overHero?: boolean
  className?: string
}) {
  const current = useLocale()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  const choose = async (locale: Locale) => {
    setOpen(false)
    if (locale === current) return

    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    })

    // refresh(), not reload(): keeps scroll position and the basket in memory,
    // and re-renders the server components with the new cookie.
    startTransition(() => router.refresh())
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onBlur={(event) => {
          if (!ref.current?.contains(event.relatedTarget as Node)) setOpen(false)
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Dil: ${localeNames[current]}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
          overHero
            ? "text-white hover:bg-white/10"
            : "text-slate-700 hover:bg-teal-50"
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Globe className="h-4 w-4" aria-hidden="true" />
        )}
        {localeShortNames[current]}
      </button>

      {open && (
        <div
          role="menu"
          className="panel-in absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-xl"
        >
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              role="menuitem"
              onClick={() => choose(locale)}
              onBlur={(event) => {
                if (!ref.current?.contains(event.relatedTarget as Node)) {
                  setOpen(false)
                }
              }}
              lang={locale}
              className={cn(
                "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-teal-50",
                locale === current
                  ? "font-medium text-primary"
                  : "text-slate-700"
              )}
            >
              {localeNames[locale]}
              {locale === current && (
                <Check className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
