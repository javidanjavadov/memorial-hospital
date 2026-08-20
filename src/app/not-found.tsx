import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Stethoscope, Phone } from "lucide-react"
import { contactInfo, telHref } from "@/data"
import { getDictionary } from "@/i18n"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary()
  return {
    title: t.pages.notFoundTitle,
    robots: { index: false, follow: false },
  }
}

/**
 * Server Component so the route can carry metadata. The previous version was a
 * Client Component purely to call `window.history.back()`, which a dead-end 404
 * does not really need — concrete destinations are more useful.
 */
export default async function NotFound() {
  const t = await getDictionary()

  return (
    <div className="min-h-[70vh] bg-[var(--paper)] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-primary/20 mb-4" aria-hidden="true">
          404
        </p>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{t.pages.notFoundTitle}</h1>
        <p className="text-slate-600 mb-8">
          {t.pages.notFoundBody}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="cta" asChild>
            <Link href="/">
              <Home className="w-4 h-4" aria-hidden="true" />
              {t.pages.goHome}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/qebul">
              <Stethoscope className="w-4 h-4" aria-hidden="true" />
              {t.pages.bookAppointment}
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
