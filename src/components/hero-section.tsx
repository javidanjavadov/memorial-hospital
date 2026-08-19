"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight, Phone, Calendar, Shield, Clock, Star } from "lucide-react"
import { departments, stats } from "@/data"

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-100/30 to-teal-100/50">
        <div className="absolute top-20 right-20 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" style={{ animation: "float 4s ease-in-out infinite 1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-300/10 rounded-full blur-3xl" style={{ animation: "float 5s ease-in-out infinite 0.5s" }} />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className={`inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <Shield className="w-4 h-4" />
                Bakıdakı ən etibarlı xəstəxana
              </div>
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                Sağlamlığınız
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {" "}
                  Bizim Prioritetimiz
                </span>
              </h1>
              <p className={`text-lg text-slate-600 max-w-xl transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                Müasir tibbi avadanlıqlar və təcrübəli həkim heyəti ilə
                keyfiyyətli səhiyyə xidməti. İndi qəbula yazılın.
              </p>
            </div>

            {/* Search Panel */}
            <div className={`bg-white rounded-2xl shadow-xl p-6 space-y-4 transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Həkim və ya şöbə axtar
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Həkim adı və ya şöbə..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="h-12 px-4 rounded-lg border border-input bg-background text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 hover:border-primary"
                >
                  <option value="">Bütün şöbələr</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="cta" size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/hekimler">
                  <Search className="w-5 h-5" />
                  Axtar
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-6">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Floating Cards */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main Card */}
              <div className={`bg-white rounded-3xl shadow-2xl p-8 transition-all duration-700 delay-300 ${mounted ? "opacity-100 rotate-2 translate-y-0" : "opacity-0 rotate-6 translate-y-8"} hover:rotate-0 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]`}>
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-110 hover:rotate-6">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Online Qəbul
                </h3>
                <p className="text-slate-600 mb-6">
                  Evdən çıxmadan qəbula yazılın. Həkiminiz sizə zəng edəcək.
                </p>
                <Button variant="cta" size="lg" className="w-full" asChild>
                  <Link href="/qebul">
                    Qəbula Yazıl
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>

              {/* Floating Card 1 */}
              <div className={`absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 transition-all duration-700 delay-500 ${mounted ? "opacity-100 -rotate-3 translate-x-0" : "opacity-0 -rotate-6 translate-x-8"} hover:rotate-0 hover:shadow-xl hover:scale-105`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">24/7</div>
                    <div className="text-xs text-slate-500">Təcili Yardım</div>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className={`absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 transition-all duration-700 delay-700 ${mounted ? "opacity-100 rotate-3 translate-x-0" : "opacity-0 rotate-6 -translate-x-8"} hover:rotate-0 hover:shadow-xl hover:scale-105`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">4.9/5</div>
                    <div className="text-xs text-slate-500">Pasiyent Reytinqi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t shadow-lg z-40 px-4 py-3">
        <div className="flex gap-3">
          <Button variant="emergency" className="flex-1" asChild>
            <a href="tel:+994557101050">
              <Phone className="w-5 h-5" />
              Təcili Zəng
            </a>
          </Button>
          <Button variant="cta" className="flex-1" asChild>
            <Link href="/qebul">
              <Calendar className="w-5 h-5" />
              Qəbula Yazıl
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
