import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { pageMetadata } from "@/lib/site"
import { getDictionary } from "@/i18n"

/* generateMetadata, not a constant: the title and description are what a
 * search engine and a shared link show, and they follow the visitor's
 * language like the page does. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary()
  return pageMetadata({
  title: t.legal.terms[0],
  description: t.legal.terms[1],
  path: "/sertler",
})
}

export default async function TermsPage() {
  const t = await getDictionary()

  return (
    <div className="min-h-screen bg-[var(--paper)] py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />{t.legal.terms[2]}</Link>
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">{t.legal.terms[0]}</h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <p className="text-slate-600">{t.legal.terms[3]}</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.terms[4]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.terms[5]}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.terms[6]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.terms[7]}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.terms[8]}</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>{t.legal.terms[9]}</li>
              <li>{t.legal.terms[10]}</li>
              <li>{t.legal.terms[11]}</li>
              <li>{t.legal.terms[12]}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">4. Cavabdehlik</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.terms[13]}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.terms[14]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.terms[15]}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.terms[16]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.terms[17]}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.terms[18]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.terms[19]}</p>
            <div className="bg-slate-50 rounded-xl p-6 space-y-2">
              <p className="text-slate-700"><strong>Email:</strong> info@memorialhospital.az</p>
              <p className="text-slate-700"><strong>Telefon:</strong> +994 55 710 10 50</p>
              <p className="text-slate-700"><strong>{t.legal.terms[20]}</strong>{t.legal.terms[21]}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
