"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, GraduationCap, ArrowRight, Search } from "lucide-react"
import { doctors, departments, branches } from "@/data"
import { useState } from "react"

export default function HekimlerPage() {
  const [filterDept, setFilterDept] = useState("")
  const [filterBranch, setFilterBranch] = useState("")
  const [search, setSearch] = useState("")

  const filtered = doctors.filter((d) => {
    const matchDept = !filterDept || d.department === filterDept
    const matchBranch = !filterBranch || d.branch === filterBranch
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
    return matchDept && matchBranch && matchSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-100/30 to-teal-100/50 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Həkimlərimiz
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Təcrübəli və peşəkar həkim heyətimiz
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Həkim axtar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="h-11 px-4 rounded-lg border border-input bg-background text-base"
            >
              <option value="">Bütün şöbələr</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="h-11 px-4 rounded-lg border border-input bg-background text-base"
            >
              <option value="">Bütün filiallar</option>
              {branches.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doctor) => (
            <Card key={doctor.id} className="group border-0 shadow-md hover:shadow-xl transition-all overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-teal-100 to-teal-50 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-700 to-teal-500 flex items-center justify-center text-white text-3xl font-bold">
                    {doctor.name.split(" ").slice(1).map((n) => n[0]).join("")}
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
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {doctor.name}
                </h3>
                <p className="text-sm text-teal-700 font-medium">{doctor.specialty}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600 mt-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {doctor.branch}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {doctor.experience} il
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium">{doctor.rating}</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-slate-600">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  {doctor.education}
                </div>
                <div className="mt-4 pt-4 border-t">
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

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">Heç bir həkim tapılmadı</p>
          </div>
        )}
      </div>
    </div>
  )
}
