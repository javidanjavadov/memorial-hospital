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
  title: t.legal.privacy[0],
  description: t.legal.privacy[1],
  path: "/siyaset",
})
}

export default async function PrivacyPolicyPage() {
  const t = await getDictionary()

  return (
    <div className="min-h-screen bg-[var(--paper)] py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />{t.legal.privacy[2]}</Link>
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">{t.legal.privacy[0]}</h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <p className="text-slate-600">{t.legal.privacy[3]}</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.privacy[4]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.privacy[5]}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.privacy[6]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.privacy[7]}</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>{t.legal.privacy[8]}</li>
              <li>{t.legal.privacy[9]}</li>
              <li>{t.profile.finCode}</li>
              <li>{t.legal.privacy[10]}</li>
              <li>{t.legal.privacy[11]}</li>
              <li>{t.legal.privacy[12]}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.privacy[13]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.privacy[14]}</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>{t.legal.privacy[15]}</li>
              <li>{t.legal.privacy[16]}</li>
              <li>{t.legal.privacy[17]}</li>
              <li>{t.legal.privacy[18]}</li>
              <li>{t.legal.privacy[19]}</li>
              <li>{t.legal.privacy[20]}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.privacy[21]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.privacy[22]}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-amber-900">{t.legal.privacy[23]}</h3>
              <p className="text-amber-800 text-sm leading-relaxed">{t.legal.privacy[24]}<strong>{t.legal.privacy[25]}</strong>{t.legal.privacy[26]}</p>
              <p className="text-amber-800 text-sm leading-relaxed">{t.legal.privacy[27]}</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.privacy[28]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.privacy[29]}</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>
                <code>memorial-auth</code>{t.legal.privacy[30]}</li>
              <li>
                <code>memorial-users</code>{t.legal.privacy[31]}</li>
              <li>
                <code>memorial-appointments</code>{t.legal.privacy[32]}</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">{t.legal.privacy[33]}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.privacy[34]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.privacy[35]}</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>{t.legal.privacy[36]}</li>
              <li>{t.legal.privacy[37]}</li>
              <li>{t.legal.privacy[38]}</li>
              <li>{t.legal.privacy[39]}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.privacy[40]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.privacy[41]}</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>{t.legal.privacy[42]}</li>
              <li>{t.legal.privacy[43]}</li>
              <li>{t.legal.privacy[44]}</li>
              <li>{t.legal.privacy[45]}</li>
              <li>{t.legal.privacy[46]}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{t.legal.privacy[47]}</h2>
            <p className="text-slate-600 leading-relaxed">{t.legal.privacy[48]}</p>
            <div className="bg-slate-50 rounded-xl p-6 space-y-2">
              <p className="text-slate-700"><strong>Email:</strong> info@memorialhospital.az</p>
              <p className="text-slate-700"><strong>Telefon:</strong> +994 55 710 10 50</p>
              <p className="text-slate-700"><strong>{t.legal.privacy[49]}</strong>{t.legal.privacy[50]}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
