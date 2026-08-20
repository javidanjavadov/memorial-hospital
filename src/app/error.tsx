"use client"

import { useT } from "@/i18n/client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import { contactInfo, telHref } from "@/data"

/**
 * Route-level error boundary. Without this any runtime error drops the visitor
 * on Next's raw error screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Replace with a real reporter (Sentry etc.) when one is wired up.
    console.error("Route error:", error)
  }, [error])

  const t = useT()

  return (
    <div className="min-h-[70vh] bg-[var(--paper)] flex items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          {t.ui.errorTitle}
        </h1>
        <p className="text-slate-600 mb-2">
          {t.ui.errorBody}
        </p>
        <p className="text-slate-600 mb-8">
          {t.ui.emergencyCall}{" "}
          <a
            href={telHref(contactInfo.phone)}
            className="font-semibold text-teal-700 underline"
          >
            {contactInfo.phone}
          </a>
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-6">
            {t.ui.errorCode}: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="cta" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
            {t.common.tryAgain}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4" />
              {t.common.home}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
