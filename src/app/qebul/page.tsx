"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm, useWatch, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, controlClass, textareaClass } from "@/components/ui/field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertCircle,
  Loader2,
} from "lucide-react"
import {
  branches,
  departments,
  doctors,
  getBranchName,
  getDepartmentName,
  getDoctorName,
} from "@/data"
import { createValidators } from "@/lib/validation"
import { missingProfileFields } from "@/lib/profile-complete"
import ProfileCompletionCard from "@/components/profile-completion-card"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
import { useT } from "@/i18n/client"
import {
  localizeBranch,
  localizeDepartment,
  localizeDoctor,
} from "@/i18n/data"

/* Built from the dictionary: a zod message is text a patient reads, and zod
   bakes it into the schema at construction, so the schema cannot be a module
   constant if the errors are to follow the page's language. */
const buildSchema = (t: ReturnType<typeof useT>) => {
  const v = createValidators(t.validation)
  return z.object({
    fullName: v.fullName,
    phone: v.phoneNumber,
    // Optional fields must accept "" — see lib/validation.ts.
    email: v.optionalEmail,
    finCode: v.optionalFinCode,
    department: z.string().min(1, t.booking.selectDepartment),
    doctor: v.optionalText(64, ""),
    branch: z.string().min(1, t.booking.selectBranch),
    date: z.string().min(1, t.booking.selectDate),
    time: z.string().min(1, t.booking.selectTime),
    complaint: v.optionalText(1000, t.booking.noteTooLong),
    consent: z.literal(true, { message: t.booking.consentRequired }),
  })
}

type Schema = ReturnType<typeof buildSchema>

type FormInput = z.input<Schema>
type FormData = z.output<Schema>

/** Fields that must be valid before the given step can be left. */
const stepFields: Record<number, (keyof FormInput)[]> = {
  1: ["fullName", "phone", "email", "finCode"],
  2: ["department", "branch", "date", "time"],
  3: ["consent"],
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
]

const todayISO = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().split("T")[0]
}

export default function QebulPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--paper)] py-16 md:py-24 flex items-center justify-center">
          <div className="text-center" role="status">
            {/* No text: this fallback renders outside the dictionary
                provider's reach, and a spinner reads the same in every
                language. */}
            <div
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"
              aria-hidden="true"
            />
          </div>
        </div>
      }
    >
      <QebulContent />
    </Suspense>
  )
}

function QebulContent() {
  const t = useT()
  const schema = useMemo(() => buildSchema(t), [t])
  const searchParams = useSearchParams()
  const doctorParam = searchParams.get("doctor")

  // Resolved during render instead of in an effect, so the form never flashes
  // step 1 before jumping to step 2.
  const preselected = doctorParam
    ? doctors.find((d) => d.id === doctorParam && d.available)
    : undefined

  const [step, setStep] = useState(preselected ? 2 : 1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [reference, setReference] = useState("")

  const user = useAuthStore((s) => s.user)
  const addAppointment = useAuthStore((s) => s.addAppointment)
  const isSlotTaken = useAuthStore((s) => s.isSlotTaken)
  const missing = user ? missingProfileFields(user) : []

  const {
    register,
    handleSubmit,
    control,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      branch: preselected?.branchId ?? "nrimanov",
      department: preselected?.department ?? "",
      doctor: preselected?.id ?? "",
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      email: user?.email ?? "",
      finCode: user?.finCode ?? "",
      date: "",
      time: "",
      complaint: "",
    },
  })

  // `useWatch` rather than `watch()`: the latter is not memoisable, which makes
  // React Compiler skip optimising this entire (large) component.
  const values = useWatch({ control: control as Control<FormInput> })
  const selectedDepartment = values.department ?? ""
  const selectedBranch = values.branch ?? ""
  const selectedDoctor = values.doctor ?? ""
  const selectedDate = values.date ?? ""

  /**
   * Filter on `branchId`, not on the human-readable `branch` label. Comparing
   * against the label silently returned zero doctors for every branch whose id
   * is not a substring of its name.
   */
  const filteredDoctors = useMemo(
    () =>
      doctors.filter(
        (d) =>
          d.department === selectedDepartment &&
          d.branchId === selectedBranch &&
          d.available
      ),
    [selectedDepartment, selectedBranch]
  )

  const today = todayISO()

  /** Slots already booked for this doctor, plus times that have already passed. */
  const unavailableSlots = useMemo(() => {
    const taken = new Set<string>()
    if (!selectedDate) return taken

    for (const slot of timeSlots) {
      if (isSlotTaken(selectedBranch, selectedDoctor || undefined, selectedDate, slot)) {
        taken.add(slot)
      }
    }

    if (selectedDate === today) {
      const now = new Date()
      const minutesNow = now.getHours() * 60 + now.getMinutes()
      for (const slot of timeSlots) {
        const [h, m] = slot.split(":").map(Number)
        if (h * 60 + m <= minutesNow) taken.add(slot)
      }
    }

    return taken
  }, [selectedBranch, selectedDoctor, selectedDate, today, isSlotTaken])

  const onSubmit = (data: FormData) => {
    setSubmitError("")
    const result = addAppointment({
      userId: user?.id ?? "guest",
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

    if (!result.ok) {
      setSubmitError(t.ui[result.error])
      return
    }

    setReference(`${data.date.replace(/-/g, "")}-${data.time.replace(":", "")}`)
    setIsSubmitted(true)
  }

  /** Validate the current step before advancing — otherwise a user can reach
   *  step 3 with empty fields and the submit silently does nothing. */
  const nextStep = async () => {
    const valid = await trigger(stepFields[step], { shouldFocus: true })
    if (valid) setStep((prev) => Math.min(prev + 1, 3))
  }

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  const startOver = () => {
    reset()
    setStep(1)
    setIsSubmitted(false)
    setSubmitError("")
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[var(--paper)] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              aria-hidden="true"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              {t.booking.requestReceived}
            </h1>
            {/*
              Deliberately does not claim an SMS or email was sent: this build
              has no backend, so nothing is actually dispatched. Saying otherwise
              would leave a patient waiting for a confirmation that never comes.
            */}
            <p className="text-slate-600 mb-4">
              {t.booking.requestRegistered}{" "}
              <strong>{t.booking.receptionWillCall}</strong>.
              {t.booking.onlyAfterOperator}
            </p>
            <p className="text-sm text-slate-500 mb-8">
              {t.booking.requestNumber} <span className="font-mono">{reference}</span>
              {user ? (
                <>
                  {" · "}
                  <Link href="/profil" className="text-teal-700 hover:underline">
                    {t.booking.viewInProfile}
                  </Link>
                </>
              ) : null}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="cta" asChild>
                <Link href="/">{t.booking.home}</Link>
              </Button>
              <Button variant="outline" onClick={startOver}>
                {t.booking.newAppointment}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t.booking.bookTitle}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t.booking.bookSubtitle}
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-3xl mx-auto mb-10">
          <ol className="flex items-center justify-between" aria-label={t.booking.bookSteps}>
            {[
              { num: 1, label: "{t.booking.stepPersonal}" },
              { num: 2, label: "{t.booking.stepDoctor}" },
              { num: 3, label: t.booking.stepConfirm },
            ].map((s, i) => (
              <li
                key={s.num}
                className="flex items-center"
                aria-current={step === s.num ? "step" : undefined}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step >= s.num
                        ? "bg-primary text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                    aria-hidden="true"
                  >
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span
                    className={`hidden sm:block text-sm font-medium ${
                      step >= s.num ? "text-primary" : "text-slate-500"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="sr-only">
                    {t.pages.stepLabel} {s.num}: {s.label}
                    {step > s.num ? ` ${t.booking.stepCompleted}` : ""}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-2 sm:mx-4 rounded ${
                      step > s.num ? "bg-primary" : "bg-slate-200"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="max-w-3xl mx-auto">
            {/* Step 1 — personal details */}
            {step === 1 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" aria-hidden="true" />
                    {t.booking.stepPersonal}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Ad Soyad" required error={errors.fullName?.message}>
                      {(field) => (
                        <Input
                          {...field}
                          autoComplete="name"
                          placeholder={t.booking.fullName}
                          {...register("fullName")}
                          className={errors.fullName ? "border-red-500" : ""}
                        />
                      )}
                    </Field>

                    <Field
                      label="{t.booking.phoneNumber}"
                      required
                      error={errors.phone?.message}
                    >
                      {(field) => (
                        <Input
                          {...field}
                          type="tel"
                          autoComplete="tel"
                          placeholder="+994 XX XXX XX XX"
                          {...register("phone")}
                          className={errors.phone ? "border-red-500" : ""}
                        />
                      )}
                    </Field>

                    {/* Previously had no error slot at all: an invalid value here
                        blocked submission with no visible explanation. */}
                    <Field
                      label="Email"
                      hint="{t.booking.optional}"
                      error={errors.email?.message}
                    >
                      {(field) => (
                        <Input
                          {...field}
                          type="email"
                          autoComplete="email"
                          placeholder="email@example.com"
                          {...register("email")}
                          className={errors.email ? "border-red-500" : ""}
                        />
                      )}
                    </Field>

                    <Field
                      label="FIN Kod"
                      hint="{t.booking.optionalFin}"
                      error={errors.finCode?.message}
                    >
                      {(field) => (
                        <Input
                          {...field}
                          placeholder="7 simvol"
                          maxLength={7}
                          {...register("finCode")}
                          className={errors.finCode ? "border-red-500" : ""}
                        />
                      )}
                    </Field>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2 — appointment details */}
            {step === 2 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-primary" aria-hidden="true" />
                    {t.booking.appointmentDetails}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label={t.booking.department} required error={errors.department?.message}>
                      {(field) => (
                        <select
                          {...field}
                          {...register("department")}
                          className={controlClass}
                        >
                          <option value="">{t.booking.selectDepartment}</option>
                          {departments.map((raw) => {
                            const dept = localizeDepartment(raw, t.data)
                            return (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            )
                          })}
                        </select>
                      )}
                    </Field>

                    <Field label="Filial" required error={errors.branch?.message}>
                      {(field) => (
                        <select
                          {...field}
                          {...register("branch")}
                          className={controlClass}
                        >
                          <option value="">{t.booking.selectBranch}</option>
                          {branches.map((raw) => {
                            const b = localizeBranch(raw, t.data)
                            return (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            )
                          })}
                        </select>
                      )}
                    </Field>

                    {selectedDepartment && (
                      <fieldset className="space-y-2 md:col-span-2">
                        <legend className="text-sm font-medium text-slate-700 mb-2">
                          {t.booking.doctor}{" "}
                          <span className="font-normal text-slate-500">
                            (ixtiyari)
                          </span>
                        </legend>
                        {filteredDoctors.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredDoctors.map((doctor) => (
                              <label
                                key={doctor.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                  selectedDoctor === doctor.id
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
                                <span>
                                  <span className="block font-medium text-slate-900">
                                    {localizeDoctor(doctor, t.data).name}
                                  </span>
                                  <span className="block text-sm text-slate-500">
                                    {doctor.specialty}
                                  </span>
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          /* Used to render nothing at all, which looked like the
                             page was broken. */
                          <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                            Seçilmiş şöbə və filial üzrə hazırda sərbəst həkim
                            yoxdur. Başqa filial seçin — və ya həkim seçmədən
                            davam edin, reqistratura sizə uyğun həkim təyin
                            edəcək.
                          </p>
                        )}
                      </fieldset>
                    )}

                    <Field label="Tarix" required error={errors.date?.message}>
                      {(field) => (
                        <Input
                          {...field}
                          type="date"
                          {...register("date")}
                          min={today}
                          className={errors.date ? "border-red-500" : ""}
                        />
                      )}
                    </Field>

                    <Field
                      label="Vaxt"
                      required
                      hint={
                        selectedDate
                          ? "{t.booking.slotsUnavailable}"
                          : "{t.booking.pickDateFirst}"
                      }
                      error={errors.time?.message}
                    >
                      {(field) => (
                        <select
                          {...field}
                          {...register("time")}
                          disabled={!selectedDate}
                          className={`${controlClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          <option value="">{t.booking.selectTime}</option>
                          {timeSlots.map((time) => {
                            const taken = unavailableSlots.has(time)
                            return (
                              <option key={time} value={time} disabled={taken}>
                                {time}
                                {taken ? " — dolu" : ""}
                              </option>
                            )
                          })}
                        </select>
                      )}
                    </Field>
                  </div>

                  <Field
                    label="{t.booking.complaint}"
                    hint="{t.booking.complaintHint}"
                    error={errors.complaint?.message}
                  >
                    {(field) => (
                      <textarea
                        {...field}
                        rows={4}
                        maxLength={1000}
                        placeholder={t.booking.complaintPlaceholder}
                        {...register("complaint")}
                        className={textareaClass}
                      />
                    )}
                  </Field>
                </CardContent>
              </Card>
            )}

            {/* Step 3 — confirmation */}
            {step === 3 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" aria-hidden="true" />
                    {t.booking.confirmAppointment}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {submitError && (
                    <div
                      role="alert"
                      className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {submitError}
                    </div>
                  )}

                  <dl className="bg-slate-50 rounded-xl p-6 space-y-4">
                    <SummaryRow icon={User} label="Ad Soyad" value={values.fullName} />
                    <SummaryRow icon={Phone} label="Telefon" value={values.phone} />
                    {values.email && (
                      <SummaryRow icon={Mail} label="Email" value={values.email} />
                    )}
                    <SummaryRow
                      icon={Stethoscope}
                      label={t.booking.department}
                      value={
                        t.data.departments?.[selectedDepartment]?.name ??
                        getDepartmentName(selectedDepartment)
                      }
                    />
                    {/* The selected doctor was missing from this summary entirely. */}
                    <SummaryRow
                      icon={Stethoscope}
                      label={t.booking.doctor}
                      value={
                        selectedDoctor
                          ? (t.data.doctorNames?.[
                              getDoctorName(selectedDoctor)
                            ] ?? getDoctorName(selectedDoctor))
                          : "{t.booking.assignedByReception}"
                      }
                    />
                    <SummaryRow
                      icon={MapPin}
                      label="Filial"
                      value={
                        t.data.branches?.[selectedBranch]?.name ??
                        getBranchName(selectedBranch)
                      }
                    />
                    <SummaryRow icon={Calendar} label="Tarix" value={values.date} />
                    <SummaryRow icon={Clock} label="Vaxt" value={values.time} />
                    {values.complaint && (
                      <SummaryRow
                        icon={FileText}
                        label="{t.booking.complaint}"
                        value={values.complaint}
                      />
                    )}
                  </dl>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <input
                        id="qebul-consent"
                        type="checkbox"
                        {...register("consent")}
                        aria-invalid={errors.consent ? true : undefined}
                        aria-describedby={
                          errors.consent ? "qebul-consent-error" : undefined
                        }
                        className="mt-1 w-4 h-4 shrink-0 accent-teal-700"
                      />
                      <label htmlFor="qebul-consent" className="text-sm text-slate-600">
                        Sağlamlıq məlumatlarım da daxil olmaqla, yuxarıdakı
                        məlumatların qəbul məqsədilə emalına razıyam.{" "}
                        <Link
                          href="/siyaset"
                          className="text-teal-700 font-medium hover:underline"
                        >
                          {t.booking.privacyPolicy}
                        </Link>
                      </label>
                    </div>
                    {errors.consent && (
                      <p
                        id="qebul-consent-error"
                        role="alert"
                        className="text-sm text-red-500"
                      >
                        {errors.consent.message}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Qeyd:</strong> Bu sorğu avtomatik təsdiqlənmir.
                      Reqistratura operatoru göstərdiyiniz nömrəyə zəng edərək
                      qəbulu təsdiqləyəcək.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Geri
                </Button>
              )}
              <div className="ml-auto">
                {step < 3 ? (
                  <Button type="button" variant="cta" onClick={nextStep}>
                    Davam Et
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                ) : user && missing.length > 0 ? (
                  /* Signed in but incomplete. A guest is not stopped here —
                     the form collects a name and a phone number itself — but
                     an account the appointment is filed under must be usable. */
                  <ProfileCompletionCard compact
                    missing={missing}
                    next="/qebul"
                    reason="{t.booking.profileNeededForBooking}"
                  />
                ) : (
                  <Button
                    type="submit"
                    variant="cta"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    )}
                    {isSubmitting ? "{t.booking.sending}" : "{t.booking.confirmButton}"}
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

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <dt className="text-sm text-slate-500">{label}</dt>
        <dd className="font-medium text-slate-900">{value || "-"}</dd>
      </div>
    </div>
  )
}
