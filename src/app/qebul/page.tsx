"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  MapPin,
  Stethoscope,
} from "lucide-react"
import { departments, doctors, branches } from "@/data"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"

const formSchema = z.object({
  fullName: z
    .string()
    .min(3, "Ad minimum 3 simvol olmalıdır")
    .max(100, "Ad maximum 100 simvol ola bilər"),
  phone: z
    .string()
    .min(10, "Telefon nömrəsi minimum 10 rəqəm olmalıdır")
    .max(15, "Telefon nömrəsi maximum 15 rəqəm ola bilər"),
  email: z.string().email("Düzgün email daxil edin").optional(),
  finCode: z
    .string()
    .length(7, "FIN kod 7 simvol olmalıdır")
    .optional(),
  department: z.string().min(1, "Şöbə seçin"),
  doctor: z.string().optional(),
  branch: z.string().min(1, "Filial seçin"),
  date: z.string().min(1, "Tarix seçin"),
  time: z.string().min(1, "Vaxt seçin"),
  complaint: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
]

export default function QebulPage() {
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { user, addAppointment } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch: "nrimanov",
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      email: user?.email || "",
      finCode: user?.finCode || "",
    },
  })

  const selectedDepartment = watch("department")
  const selectedBranch = watch("branch")

  const filteredDoctors = doctors.filter(
    (d) =>
      d.department === selectedDepartment &&
      d.branch.toLowerCase().includes(selectedBranch.toLowerCase()) &&
      d.available
  )

  const onSubmit = (data: FormData) => {
    addAppointment({
      userId: user?.id || "guest",
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      finCode: data.finCode,
      department: data.department,
      doctor: data.doctor,
      branch: data.branch,
      date: data.date,
      time: data.time,
      complaint: data.complaint,
    })
    setIsSubmitted(true)
  }

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-teal-100/30 to-teal-100/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Qəbul uğurla yaradıldı!
            </h1>
            <p className="text-slate-600 mb-8">
              Qəbulunuz haqqında məlumat sizə email və SMS vasitəsilə
              göndərildi. Həkiminiz sizə zəng edəcək.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="cta" asChild>
                <Link href="/">Ana Səhifə</Link>
              </Button>
              <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                Yeni Qəbul Yarat
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-100/30 to-teal-100/50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Qəbula Yazıl
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Aşağıdakı formu doldurun və qəbulunuzu təsdiqləyin
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Şəxsi Məlumatlar" },
              { num: 2, label: "Həkim Seçimi" },
              { num: 3, label: "Təsdiq" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step >= s.num
                        ? "bg-primary text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step > s.num ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    className={`hidden sm:block text-sm font-medium ${
                      step >= s.num ? "text-primary" : "text-slate-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-2 sm:mx-4 rounded ${
                      step > s.num ? "bg-primary" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-w-3xl mx-auto">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Şəxsi Məlumatlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Ad Soyad *
                      </label>
                      <Input
                        placeholder="Adınız və soyadınız"
                        {...register("fullName")}
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-500">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Telefon Nömrəsi *
                      </label>
                      <Input
                        type="tel"
                        placeholder="+994 XX XXX XX XX"
                        {...register("phone")}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...register("email")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        FIN Kod
                      </label>
                      <Input
                        placeholder="7 simvol"
                        maxLength={7}
                        {...register("finCode")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Appointment Details */}
            {step === 2 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    Qəbul Məlumatları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Şöbə *
                      </label>
                      <select
                        {...register("department")}
                        className={`w-full h-11 px-4 rounded-lg border bg-background text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          errors.department ? "border-red-500" : "border-input"
                        }`}
                      >
                        <option value="">Şöbə seçin</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {errors.department && (
                        <p className="text-sm text-red-500">
                          {errors.department.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Filial *
                      </label>
                      <select
                        {...register("branch")}
                        className={`w-full h-11 px-4 rounded-lg border bg-background text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          errors.branch ? "border-red-500" : "border-input"
                        }`}
                      >
                        <option value="">Filial seçin</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                      {errors.branch && (
                        <p className="text-sm text-red-500">
                          {errors.branch.message}
                        </p>
                      )}
                    </div>

                    {selectedDepartment && filteredDoctors.length > 0 && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">
                          Həkim
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredDoctors.map((doctor) => (
                            <label
                              key={doctor.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                watch("doctor") === doctor.id
                                  ? "border-primary bg-primary/5"
                                  : "border-slate-200 hover:border-primary/50"
                              }`}
                            >
                              <input
                                type="radio"
                                value={doctor.id}
                                {...register("doctor")}
                                className="w-4 h-4 text-primary"
                              />
                              <div>
                                <div className="font-medium text-slate-900">
                                  {doctor.name}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {doctor.specialty}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Tarix *
                      </label>
                      <Input
                        type="date"
                        {...register("date")}
                        min={new Date().toISOString().split("T")[0]}
                        className={errors.date ? "border-red-500" : ""}
                      />
                      {errors.date && (
                        <p className="text-sm text-red-500">
                          {errors.date.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Vaxt *
                      </label>
                      <select
                        {...register("time")}
                        className={`w-full h-11 px-4 rounded-lg border bg-background text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          errors.time ? "border-red-500" : "border-input"
                        }`}
                      >
                        <option value="">Vaxt seçin</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {errors.time && (
                        <p className="text-sm text-red-500">
                          {errors.time.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Şikayət / Qeyd
                    </label>
                    <textarea
                      {...register("complaint")}
                      rows={4}
                      placeholder="Şikayətinizi qeyd edin (ixtiyari)"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Qəbulu Təsdiqləyin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-slate-500">Ad Soyad</div>
                        <div className="font-medium text-slate-900">
                          {watch("fullName")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-slate-500">Telefon</div>
                        <div className="font-medium text-slate-900">
                          {watch("phone")}
                        </div>
                      </div>
                    </div>
                    {watch("email") && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-primary" />
                        <div>
                          <div className="text-sm text-slate-500">Email</div>
                          <div className="font-medium text-slate-900">
                            {watch("email")}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-slate-500">Şöbə</div>
                        <div className="font-medium text-slate-900">
                          {departments.find((d) => d.id === selectedDepartment)
                            ?.name || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-slate-500">Filial</div>
                        <div className="font-medium text-slate-900">
                          {branches.find((b) => b.id === selectedBranch)?.name ||
                            "-"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-slate-500">Tarix</div>
                        <div className="font-medium text-slate-900">
                          {watch("date")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-slate-500">Vaxt</div>
                        <div className="font-medium text-slate-900">
                          {watch("time")}
                        </div>
                      </div>
                    </div>
                    {watch("complaint") && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="text-sm text-slate-500">
                            Şikayət / Qeyd
                          </div>
                          <div className="font-medium text-slate-900">
                            {watch("complaint")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Qeyd:</strong> Qəbulunuz təsdiqləndikdən sonra
                      telefon nömrənizə SMS və email ünvanınıza məlumat
                      göndəriləcək. Həkiminiz qəbuldan əvvəl sizə zəng
                      edəcək.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4" />
                  Geri
                </Button>
              )}
              <div className="ml-auto">
                {step < 3 ? (
                  <Button type="button" variant="cta" onClick={nextStep}>
                    Davam Et
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button type="submit" variant="cta" size="lg">
                    <CheckCircle className="w-5 h-5" />
                    Qəbulu Təsdiqlə
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
