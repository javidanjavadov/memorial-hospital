import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Xidmətlər",
  description:
    "Memorial Hospital xidmətləri və qiymətləri — kompleks müayinə, kardioloji müayinə, laboratoriya analizləri və daha çox.",
  path: "/xidmetler",
})

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, ArrowRight } from "lucide-react"
import { departments, services } from "@/data"
import Link from "next/link"

export default function XidmetlerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-100/30 to-teal-100/50 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Xidmətlərimiz
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Müasir tibbi avadanlıqlar və təcrübəli həkim heyəti ilə geniş spektrdə
            tibbi xidmətlər
          </p>
        </div>

        {/* Departments */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Şöbələr</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <Card key={dept.id} className="group border-0 shadow-md hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${dept.color} rounded-xl flex items-center justify-center mb-4`}>
                    <dept.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{dept.name}</h3>
                  <p className="text-sm text-slate-600">{dept.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Populyar Xidmətlər</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="group border-0 shadow-md hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-700 transition-colors">
                      <service.icon className="w-7 h-7 text-teal-700 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{service.name}</h3>
                      <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">{service.price}</Badge>
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/qebul">
                            Sifariş Et
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Sürətli Nəticə</h4>
              <p className="text-sm text-slate-600">Laboratoriya nəticələri 1-2 saat ərzində</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Online Qəbul</h4>
              <p className="text-sm text-slate-600">Evdən çıxmadan qəbula yazılın</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Sığorta Qəbulu</h4>
              <p className="text-sm text-slate-600">Bütün növ tibbi sığortaları qəbul edirik</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
