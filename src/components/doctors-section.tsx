"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Star,
  MapPin,
  Clock,
  GraduationCap,
} from "lucide-react"
import { doctors } from "@/data"

export default function DoctorsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Həkimlərimiz
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Təcrübəli və peşəkar həkim heyətimiz sizə ən yaxşı tibbi
            xidməti göstərməyə hazırdır
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.slice(0, 6).map((doctor) => (
            <Card
              key={doctor.id}
              className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold">
                    {doctor.name
                      .split(" ")
                      .slice(1)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>
                {doctor.available && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="success" className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Qəbul açıq
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors duration-300">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-primary font-medium">
                      {doctor.specialty}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {doctor.branch}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {doctor.experience} il
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-sm font-medium text-slate-900">
                      {doctor.rating}
                    </span>
                    <span className="text-xs text-slate-500">(120+ rəy)</span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    {doctor.education}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2">
                    {doctor.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs transition-transform duration-200 hover:scale-105">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <Button variant="cta" className="w-full" asChild>
                    <Link href={`/qebul?doctor=${doctor.id}`}>
                      Qəbula Yazıl
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link href="/hekimler">
              Bütün Həkimlər
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
