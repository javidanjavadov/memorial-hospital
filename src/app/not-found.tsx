"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-50/30 to-teal-100/50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Səhifə Tapılmadı
        </h1>
        <p className="text-slate-600 mb-8">
          Axtardığınız səhifə mövcud deyil və ya köçürülüb.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="cta" asChild>
            <Link href="/">
              <Home className="w-4 h-4" />
              Ana Səhifə
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
        </div>
      </div>
    </div>
  )
}
