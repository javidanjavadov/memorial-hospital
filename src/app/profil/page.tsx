"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, controlClass } from "@/components/ui/field"
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
  Loader2,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useCurrentUser } from "@/lib/use-current-user"
import { getBranchName, getDepartmentName, getDoctorName } from "@/data"
import {
  fatherName,
  firstName,
  gender,
  lastName,
  phoneNumber,
  requiredEmail,
  requiredFinCode,
} from "@/lib/validation"

const profileSchema = z.object({
  firstName,
  lastName,
  fatherName,
  gender,
  email: requiredEmail,
  phone: phoneNumber,
  finCode: requiredFinCode,
})

type ProfileInput = z.input<typeof profileSchema>
type ProfileData = z.output<typeof profileSchema>

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

export default function ProfilPage() {
  const router = useRouter()
  // Either login method resolves to the same shape here.
  const { user, isLoading, source } = useCurrentUser()
  const hasHydrated = !isLoading
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const appointments = useAuthStore((s) => s.appointments)
  const cancelAppointment = useAuthStore((s) => s.cancelAppointment)

  const [activeTab, setActiveTab] = useState<"profile" | "appointments">("profile")
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [cancelError, setCancelError] = useState("")

  // Wait for the persisted store to load before deciding the visitor is a guest;
  // redirecting on the first render logged real users straight back out.
  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace("/giris")
    }
  }, [hasHydrated, user, router])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput, unknown, ProfileData>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      fatherName: user?.fatherName ?? "",
      gender: user?.gender ?? "FEMALE",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      finCode: user?.finCode ?? "",
    },
  })

  if (!hasHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Yüklənir</span>
      </div>
    )
  }

  if (!user) return null

  /**
   * Saves on submit. Previously every keystroke wrote straight to the store,
   * so a half-typed email was persisted immediately and the button was inert.
   */
  const onSubmit = (data: ProfileData) => {
    setSaveError("")
    setSaved(false)
    if (source === "google") {
      setSaveError(
        "Google hesabı ilə daxil olduqda profil məlumatları hələlik dəyişdirilə bilmir."
      )
      return
    }
    const result = updateProfile(data)
    if (!result.ok) {
      setSaveError(result.error)
      return
    }
    reset(data)
    setSaved(true)
  }

  const onCancelAppointment = (id: string, label: string) => {
    setCancelError("")
    if (!window.confirm(`${label} qəbulunu ləğv etmək istədiyinizə əminsiniz?`)) {
      return
    }
    const result = cancelAppointment(id)
    if (!result.ok) setCancelError(result.error)
  }

  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")

  return (
    <div className="min-h-screen bg-[var(--paper)] py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 bg-[var(--ink)] rounded-2xl flex items-center justify-center text-white text-xl font-bold"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.fullName}</h1>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6" role="tablist" aria-label="Profil bölmələri">
          <Button
            role="tab"
            id="tab-profile"
            aria-selected={activeTab === "profile"}
            aria-controls="panel-profile"
            variant={activeTab === "profile" ? "cta" : "outline"}
            onClick={() => setActiveTab("profile")}
          >
            <User className="w-4 h-4" aria-hidden="true" />
            Profilim
          </Button>
          <Button
            role="tab"
            id="tab-appointments"
            aria-selected={activeTab === "appointments"}
            aria-controls="panel-appointments"
            variant={activeTab === "appointments" ? "cta" : "outline"}
            onClick={() => setActiveTab("appointments")}
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            Qəbularım ({appointments.length})
          </Button>
        </div>

        {activeTab === "profile" && (
          <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Şəxsi Məlumatlar</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  {saved && (
                    <div
                      role="status"
                      className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" aria-hidden="true" />
                      Məlumatlar uğurla yeniləndi!
                    </div>
                  )}
                  {saveError && (
                    <div
                      role="alert"
                      className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    >
                      <AlertCircle className="w-4 h-4" aria-hidden="true" />
                      {saveError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Ad" required error={errors.firstName?.message}>
                      {(field) => (
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                            aria-hidden="true"
                          />
                          <Input
                            {...field}
                            autoComplete="given-name"
                            {...register("firstName")}
                            className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
                          />
                        </div>
                      )}
                    </Field>

                    <Field label="Soyad" required error={errors.lastName?.message}>
                      {(field) => (
                        <Input
                          {...field}
                          autoComplete="family-name"
                          {...register("lastName")}
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                      )}
                    </Field>

                    <Field label="Ata adı" required error={errors.fatherName?.message}>
                      {(field) => (
                        <Input
                          {...field}
                          autoComplete="additional-name"
                          {...register("fatherName")}
                          className={errors.fatherName ? "border-red-500" : ""}
                        />
                      )}
                    </Field>

                    <Field label="Cins" required error={errors.gender?.message}>
                      {(field) => (
                        <select {...field} {...register("gender")} className={controlClass}>
                          <option value="FEMALE">Qadın</option>
                          <option value="MALE">Kişi</option>
                        </select>
                      )}
                    </Field>

                    <Field label="Email" required error={errors.email?.message}>
                      {(field) => (
                        <div className="relative">
                          <Mail
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                            aria-hidden="true"
                          />
                          <Input
                            {...field}
                            type="email"
                            autoComplete="email"
                            {...register("email")}
                            className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                          />
                        </div>
                      )}
                    </Field>

                    <Field label="Telefon" required error={errors.phone?.message}>
                      {(field) => (
                        <div className="relative">
                          <Phone
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                            aria-hidden="true"
                          />
                          <Input
                            {...field}
                            type="tel"
                            autoComplete="tel"
                            {...register("phone")}
                            className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                          />
                        </div>
                      )}
                    </Field>

                    <Field
                      label="FIN Kod"
                      required
                      hint="7 simvol — analiz nəticələri bu kodla tapılır."
                      error={errors.finCode?.message}
                    >
                      {(field) => (
                        <Input
                          {...field}
                          maxLength={7}
                          placeholder="7 simvol"
                          {...register("finCode")}
                          className={errors.finCode ? "border-red-500" : ""}
                        />
                      )}
                    </Field>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      variant="cta"
                      disabled={isSubmitting || !isDirty}
                    >
                      <Save className="w-4 h-4" aria-hidden="true" />
                      Yadda Saxla
                    </Button>
                    {isDirty && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          reset()
                          setSaveError("")
                          setSaved(false)
                        }}
                      >
                        Ləğv et
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "appointments" && (
          <div
            role="tabpanel"
            id="panel-appointments"
            aria-labelledby="tab-appointments"
            className="space-y-4"
          >
            {cancelError && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {cancelError}
              </div>
            )}

            {appointments.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-16 text-center">
                  <Calendar
                    className="w-16 h-16 text-slate-300 mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <h2 className="text-lg font-semibold text-slate-700 mb-2">
                    Hələ qəbulunuz yoxdur
                  </h2>
                  <p className="text-slate-500 mb-6">İlk qəbulunuzu yaradın</p>
                  <Button variant="cta" asChild>
                    <Link href="/qebul">
                      <Stethoscope className="w-4 h-4" aria-hidden="true" />
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
                          <h2 className="font-semibold text-slate-900">
                            {getDepartmentName(apt.department)}
                          </h2>
                          <Badge className={statusColors[apt.status]}>
                            {statusLabels[apt.status]}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          {apt.doctor && (
                            <div className="flex items-center gap-1">
                              <Stethoscope
                                className="w-4 h-4 text-teal-600"
                                aria-hidden="true"
                              />
                              {getDoctorName(apt.doctor)}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-teal-600" aria-hidden="true" />
                            {getBranchName(apt.branch)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar
                              className="w-4 h-4 text-teal-600"
                              aria-hidden="true"
                            />
                            <time dateTime={apt.date}>{apt.date}</time>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-teal-600" aria-hidden="true" />
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
                          onClick={() =>
                            onCancelAppointment(
                              apt.id,
                              `${apt.date} ${apt.time}`
                            )
                          }
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" aria-hidden="true" />
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
