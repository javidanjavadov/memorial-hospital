"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Save,
  XCircle,
  Stethoscope,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { departments, doctors, branches } from "@/data"

export default function ProfilPage() {
  const router = useRouter()
  const { user, updateProfile, appointments, cancelAppointment } = useAuthStore()
  const [activeTab, setActiveTab] = useState<"profile" | "appointments">("profile")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/giris")
    }
  }, [user, router])

  if (!user) return null

  const handleSaveProfile = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const statusLabels: Record<string, string> = {
    pending: "Gözləmədə",
    confirmed: "Təsdiqlənib",
    completed: "Tamamlanıb",
    cancelled: "Ləğv edilib",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-100/30 to-teal-100/50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-700 to-teal-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {user.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.fullName}</h1>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "profile" ? "cta" : "outline"}
            onClick={() => setActiveTab("profile")}
          >
            <User className="w-4 h-4" />
            Profilim
          </Button>
          <Button
            variant={activeTab === "appointments" ? "cta" : "outline"}
            onClick={() => setActiveTab("appointments")}
          >
            <Calendar className="w-4 h-4" />
            Qəbularım ({appointments.length})
          </Button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Şəxsi Məlumatlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {saved && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Məlumatlar uğurla yeniləndi!
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ad Soyad</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      defaultValue={user.fullName}
                      className="pl-10"
                      onChange={(e) => updateProfile({ fullName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      defaultValue={user.email}
                      className="pl-10"
                      onChange={(e) => updateProfile({ email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="tel"
                      defaultValue={user.phone}
                      className="pl-10"
                      onChange={(e) => updateProfile({ phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">FIN Kod</label>
                  <Input
                    defaultValue={user.finCode || ""}
                    maxLength={7}
                    placeholder="7 simvol"
                    onChange={(e) => updateProfile({ finCode: e.target.value })}
                  />
                </div>
              </div>
              <Button variant="cta" onClick={handleSaveProfile}>
                <Save className="w-4 h-4" />
                Yadda Saxla
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-16 text-center">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Hələ qəbulunuz yoxdur
                  </h3>
                  <p className="text-slate-500 mb-6">
                    İlk qəbulunuzu yaradın
                  </p>
                  <Button variant="cta" asChild>
                    <Link href="/qebul">
                      <Stethoscope className="w-4 h-4" />
                      Qəbula Yazıl
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              appointments.map((apt) => (
                <Card key={apt.id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-slate-900">
                            {departments.find((d) => d.id === apt.department)?.name || apt.department}
                          </h3>
                          <Badge className={statusColors[apt.status]}>
                            {statusLabels[apt.status]}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          {apt.doctor && (
                            <div className="flex items-center gap-1">
                              <Stethoscope className="w-4 h-4 text-teal-600" />
                              {doctors.find((d) => d.id === apt.doctor)?.name || apt.doctor}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-teal-600" />
                            {branches.find((b) => b.id === apt.branch)?.name || apt.branch}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-teal-600" />
                            {apt.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-teal-600" />
                            {apt.time}
                          </div>
                        </div>
                        {apt.complaint && (
                          <p className="text-sm text-slate-500">{apt.complaint}</p>
                        )}
                      </div>
                      {apt.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelAppointment(apt.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Ləğv Et
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
