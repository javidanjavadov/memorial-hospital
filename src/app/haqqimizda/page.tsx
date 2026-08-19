import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Award, Heart, Target } from "lucide-react"
import { FOUNDED_YEAR, YEARS_OF_EXPERIENCE } from "@/data"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Haqqımızda",
  description:
    "Memorial Hospital tarixi, dəyərləri və komandası — 2009-cu ildən Bakıda keyfiyyətli tibbi xidmət.",
  path: "/haqqimizda",
})

const values = [
  {
    icon: Shield,
    title: "Keyfiyyət",
    description: "Beynəlxalq standartlara cavab verən tibbi xidmət",
  },
  {
    icon: Heart,
    title: "İnsanənlik",
    description: "Hər pasiyentə fərdi və diqqətli yanaşma",
  },
  {
    icon: Award,
    title: "Peşəkarlıq",
    description: "Təcrübəli həkim heyəti və müasir avadanlıqlar",
  },
  {
    icon: Target,
    title: "İnkişaf",
    description: "Daim tibbi biliklərimizi artırırıq",
  },
]

const timeline = [
  { year: String(FOUNDED_YEAR), event: "Memorial Hospital təsis edildi" },
  { year: "2012", event: "Qarayev filialı açıldı" },
  { year: "2015", event: "Laboratoriya mərkəzi istifadəyə verildi" },
  { year: "2018", event: "Gəncə filialı açıldı" },
  { year: "2020", event: "Onlayn qəbul sistemi tətbiq edildi" },
  { year: "2023", event: "100-cü mininci pasiyent qəbul edildi" },
]

export default function HaqqimizdaPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Haqqımızda
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Memorial Hospital {FOUNDED_YEAR}-cu ildən Bakıda keyfiyyətli tibbi
              xidmət göstərir. {YEARS_OF_EXPERIENCE} ildən artıq təcrübəmiz, 50-dən çox təcrübəli
              həkimimiz və 3 filialımız ilə sizlərin xidmətindəyik.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Dəyərlərimiz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <Card key={i} className="border-0 shadow-md text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-teal-700" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-slate-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Tarixçəmiz
          </h2>
          <div className="max-w-2xl mx-auto">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {item.year}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-teal-200 mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-slate-700 font-medium">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
