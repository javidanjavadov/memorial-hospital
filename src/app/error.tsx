"use client"

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

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-white via-teal-100/30 to-teal-100/50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Gözlənilməz xəta baş verdi
        </h1>
        <p className="text-slate-600 mb-2">
          Səhifəni yükləyərkən problem yarandı. Zəhmət olmasa yenidən cəhd edin.
        </p>
        <p className="text-slate-600 mb-8">
          Təcili hallarda bizə zəng edin:{" "}
          <a
            href={telHref(contactInfo.phone)}
            className="font-semibold text-teal-700 underline"
          >
            {contactInfo.phone}
          </a>
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-6">Xəta kodu: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="cta" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
            Yenidən cəhd et
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4" />
              Ana Səhifə
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
