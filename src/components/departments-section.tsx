"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { departments } from "@/data"
import { AnimateOnScroll, StaggerContainer } from "@/components/animations"

export default function DepartmentsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="up">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Şöbələrimiz
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Müasir tibbi avadanlıqlar və təcrübəli həkim heyəti ilə
              geniş spektrdə tibbi xidmətlər göstəririk
            </p>
          </div>
        </AnimateOnScroll>

        <StaggerContainer>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <Link
                key={dept.id}
                href={`/xidmetler#${dept.id}`}
                className="group opacity-0 translate-y-4 transition-all duration-500"
              >
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-1">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${dept.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    <dept.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-primary transition-colors duration-300">
                    {dept.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {dept.description}
                  </p>
                  <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                    Ətraflı
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </StaggerContainer>

        <AnimateOnScroll animation="up" delay={400}>
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link href="/xidmetler">
                Bütün Xidmətlər
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
