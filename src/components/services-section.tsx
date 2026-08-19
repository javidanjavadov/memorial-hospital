"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Clock, CheckCircle } from "lucide-react"
import { services } from "@/data"
import Link from "next/link"

export default function ServicesSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Populyar Xidmətlər
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ən çox tələb olunan tibbi xidmətlərimiz və onların qiymətləri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <div className="h-2 bg-gradient-to-r from-primary to-accent transition-all duration-500 group-hover:h-3" />
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <service.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-slate-600 mb-4">{service.description}</p>

                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {service.duration}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xl font-bold text-primary">
                    {service.price}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/qebul" className="group/btn">
                      Sifariş Et
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-6">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Sürətli Nəticə
              </h4>
              <p className="text-sm text-slate-600">
                Laboratoriya nəticələri 1-2 saat ərzində hazır olur
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-6">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Online Qəbul
              </h4>
              <p className="text-sm text-slate-600">
                Evdən çıxmadan qəbula yazılın və online ödəniş edin
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-6">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Sığorta Qəbulu
              </h4>
              <p className="text-sm text-slate-600">
                Bütün növ tibbi sığortaları qəbul edirik
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
