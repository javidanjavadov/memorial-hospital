"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Clock, ArrowRight, Navigation } from "lucide-react"
import { branches, telHref } from "@/data"

export default function BranchesSection() {
  return (
    <section className="py-16 md:py-24 bg-[var(--paper)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Filiallarımız
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sizinə ən yaxın filialı seçin və keyfiyyətli tibbi xidmətdən
            yararlanın
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card
              key={branch.id}
              id={branch.id}
              className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <div className="h-48 bg-[var(--secondary)] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-primary mx-auto mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />
                    <span className="text-sm font-medium text-primary">
                      Xəritədə bax
                    </span>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <a
                    href={branch.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-12"
                  >
                    <Navigation className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors duration-300">
                  {branch.name}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">{branch.address}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <a
                      href={telHref(branch.phone)}
                      className="text-sm text-slate-600 hover:text-primary transition-colors duration-200"
                    >
                      {branch.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">
                      {branch.workingHours}
                    </span>
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
    </section>
  )
}
