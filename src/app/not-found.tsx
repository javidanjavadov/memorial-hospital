import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Stethoscope, Phone } from "lucide-react"
import { contactInfo, telHref } from "@/data"

export const metadata: Metadata = {
  title: "Səhifə tapılmadı",
  robots: { index: false, follow: false },
}

/**
 * Server Component so the route can carry metadata. The previous version was a
 * Client Component purely to call `window.history.back()`, which a dead-end 404
 * does not really need — concrete destinations are more useful.
 */
export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-[var(--paper)] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-primary/20 mb-4" aria-hidden="true">
          404
        </p>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Səhifə Tapılmadı</h1>
        <p className="text-slate-600 mb-8">
          Axtardığınız səhifə mövcud deyil və ya köçürülüb.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="cta" asChild>
            <Link href="/">
              <Home className="w-4 h-4" aria-hidden="true" />
              Ana Səhifə
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/qebul">
              <Stethoscope className="w-4 h-4" aria-hidden="true" />
              Qəbula Yazıl
            </Link>
          </Button>
        </div>
        <p className="text-sm text-slate-500 mt-8">
          Kömək lazımdır?{" "}
          <a
            href={telHref(contactInfo.phone)}
            className="text-teal-700 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            {contactInfo.phone}
          </a>
        </p>
      </div>
    </div>
  )
}
