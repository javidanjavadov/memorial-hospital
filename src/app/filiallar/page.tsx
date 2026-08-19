import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Filiallar",
  description:
    "Memorial Hospital filialları — ünvanlar, telefon nömrələri və iş saatları.",
  path: "/filiallar",
})

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Clock, ArrowRight, Navigation } from "lucide-react"
import { branches, telHref } from "@/data"

export default function FiliallarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-100/30 to-teal-100/50 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Filiallarımız
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sizinə ən yaxın filialı seçin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {branches.map((branch) => (
            <Card key={branch.id} id={branch.id} className="group border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-teal-100 to-teal-50 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-teal-700 mx-auto mb-2" />
                    <span className="text-sm font-medium text-teal-700">Xəritədə bax</span>
                  </div>
                </div>
                <a
                  href={branch.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-teal-700 hover:text-white transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                </a>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-teal-700 transition-colors">
                  {branch.name}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-teal-700 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">{branch.address}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-teal-700 mt-0.5 shrink-0" />
                    <a href={telHref(branch.phone)} className="text-sm text-slate-600 hover:text-teal-700 transition-colors">
                      {branch.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-teal-700 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">{branch.workingHours}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t flex gap-3">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={telHref(branch.phone)}>
                      <Phone className="w-4 h-4" />
                      Zəng Et
                    </a>
                  </Button>
                  <Button variant="cta" className="flex-1" asChild>
                    <Link href="/qebul">
                      Qəbula Yazıl
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
