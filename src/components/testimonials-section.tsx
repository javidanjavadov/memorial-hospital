"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimateOnScroll } from "@/components/animations"

const testimonials = [
  {
    id: 1,
    name: "Ayşən Məmmədova",
    age: 35,
    rating: 5,
    comment:
      "Kardioloji müayinədən keçdim. Həkim Əli Hüseynov çox peşəkar və diqqətli idi. Nəticələr çox yaxşı oldu. Təşəkkür edirəm!",
    department: "Kardiologiya",
  },
  {
    id: 2,
    name: "Rəşad Quliyev",
    age: 42,
    rating: 5,
    comment:
      "Uşağımı pediatr Günel xanıma apardım. Çox mehriban və təcrübəli həkimdir. Uşağım ondan çox razı qaldı. Hər kəsə tövsiyə edirəm.",
    department: "Pediatriya",
  },
  {
    id: 3,
    name: "Leyla Əliyeva",
    age: 28,
    rating: 5,
    comment:
      "Kompleks müayinə olduqca ətraflı keçdi. Nəticələr tez hazır oldu və həkim hər şeyi ətraflı izah etdi. Xidmət keyfiyyəti çox yüksəkdir.",
    department: "Check-up",
  },
  {
    id: 4,
    name: "Tural Həsənov",
    age: 55,
    rating: 4,
    comment:
      "Ortopediya şöbəsində müalicə olundum. Həkim Rəşad Quliyev çox təcrübəli və peşəkardır. Artıq sağalıram. Çox sağ olun!",
    department: "Ortopediya",
  },
]

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    )
  }

  const prev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    )
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="up">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Pasiyent Rəyləri
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Pasiyentlərimizin bizim haqqımızda dedikləri
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="scale">
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-6">
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-lg">
                              {testimonial.name}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {testimonial.age} yaş
                            </p>
                            <Badge variant="secondary" className="mt-1 transition-transform duration-200 hover:scale-105">
                              {testimonial.department}
                            </Badge>
                          </div>
                          <Quote className="w-10 h-10 text-primary/20 ml-auto" />
                        </div>

                        <div className="flex items-center gap-1 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 transition-all duration-300 ${
                                i < testimonial.rating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-slate-200"
                              }`}
                              style={{ transitionDelay: `${i * 50}ms` }}
                            />
                          ))}
                        </div>

                        <p className="text-slate-600 leading-relaxed text-lg">
                          &ldquo;{testimonial.comment}&rdquo;
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                className="rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-primary w-8 h-3"
                        : "bg-slate-200 hover:bg-slate-300 w-3 h-3"
                    }`}
                    aria-label={`Rəy ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={next}
                className="rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
