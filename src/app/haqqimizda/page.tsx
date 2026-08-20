import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Award, Heart, Target } from "lucide-react"
import { FOUNDED_YEAR, YEARS_OF_EXPERIENCE } from "@/data"
import { pageMetadata } from "@/lib/site"
import { getDictionary } from "@/i18n"
import { fill } from "@/i18n/format"

/*
 * generateMetadata rather than a static object: the title and description are
 * what a search engine and a shared link show, and they have to follow the
 * visitor's language like the page itself.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary()
  return pageMetadata({
    title: t.pages.aboutTitle,
    description: t.pages.aboutSubtitle,
    path: "/haqqimizda",
  })
}

/* Built from the dictionary at render time: a module-level array is evaluated
   once at import, before any locale is known. */
type Copy = Awaited<ReturnType<typeof getDictionary>>

const buildValues = (t: Copy) => [
  { icon: Shield, title: t.pages.valueQuality, description: t.pages.valueQualityBody },
  { icon: Heart, title: t.pages.valueHumanity, description: t.pages.valueHumanityBody },
  {
    icon: Award,
    title: t.pages.valueProfessionalism,
    description: t.pages.valueProfessionalismBody,
  },
  { icon: Target, title: t.pages.valueGrowth, description: t.pages.valueGrowthBody },
]

const buildTimeline = (t: Copy) => [
  { year: String(FOUNDED_YEAR), event: t.pages.milestoneFounded },
  { year: "2012", event: t.pages.milestoneQarayev },
  { year: "2015", event: t.pages.milestoneLab },
  { year: "2018", event: t.pages.milestoneGanja },
  { year: "2020", event: t.pages.milestoneOnline },
  { year: "2023", event: t.pages.milestonePatients },
]

export default async function HaqqimizdaPage() {
  const t = await getDictionary()
  const values = buildValues(t)
  const timeline = buildTimeline(t)

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              {t.pages.aboutTitle}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
{fill(t.pages.aboutIntro, {
                year: FOUNDED_YEAR,
                years: YEARS_OF_EXPERIENCE,
                branches: 3,
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            {t.pages.valuesTitle}
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
            {t.pages.historyTitle}
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
