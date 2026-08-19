"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  Lock,
  Mail,
  Phone,
  Calendar,
  FileText,
  RotateCcw,
  ShoppingBag,
  Clock,
  MapPin,
  Save,
  XCircle,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { missingProfileFields } from "@/lib/profile-complete"
import { useAuthStore } from "@/lib/auth-store"
import { ordersFor, useBasketStore } from "@/lib/basket-store"
import { shortServiceName } from "@/lib/service-name"
import { useCurrentUser } from "@/lib/use-current-user"
import {
  contactInfo,
  getBranchName,
  getDepartmentName,
  getDoctorName,
  telHref,
} from "@/data"
import {
  fatherName,
  firstName,
  gender,
  lastName,
  phoneNumber,
  requiredEmail,
  requiredFinCode,
  birthDate,
} from "@/lib/validation"

const profileSchema = z.object({
  firstName,
  lastName,
  fatherName,
  gender,
  birthDate,
  email: requiredEmail,
  phone: phoneNumber,
  finCode: requiredFinCode,
})

type ProfileInput = z.input<typeof profileSchema>
type ProfileData = z.output<typeof profileSchema>

/**
 * dd.MM.yyyy, written out rather than left to toLocaleDateString("az-AZ").
 * Not every engine ships an Azerbaijani calendar format, and the ones that do
 * not fall back to "2026 M08 20" — which is not a date anyone here reads.
 */
const formatDate = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

const formatAzn = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(2)} AZN`

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

function ProfilPageInner() {
  const router = useRouter()
  // Either login method resolves to the same shape here.
  const { user, isLoading, source } = useCurrentUser()
  const hasHydrated = !isLoading
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const saveGoogleProfile = useAuthStore((s) => s.saveGoogleProfile)
  const appointments = useAuthStore((s) => s.appointments)
  const cancelAppointment = useAuthStore((s) => s.cancelAppointment)
  const allOrders = useBasketStore((s) => s.orders)
  const reorder = useBasketStore((s) => s.reorder)

  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<
    "profile" | "appointments" | "orders" | "results"
  >(() => {
    // Deep link, so "Nəticələrimə bax" in the header can open this section
    // directly instead of dropping the visitor on the profile form.
    const tab = searchParams.get("tab")
    return tab === "results" || tab === "orders" || tab === "appointments"
      ? tab
      : "profile"
  })
  const [saved, setSaved] = useState(false)
  /*
   * Where to go once the profile is usable. Restricted to a same-site path:
   * accepting an arbitrary URL would let a link hand someone off to a
   * look-alike site the moment they finish filling in their FIN.
   */
  const nextParam = searchParams.get("next")
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : null
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
      birthDate: user?.birthDate ?? "",
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
    /*
     * A Google session has no local account behind it until this runs. Blocking
     * the save here — as this did — left those visitors permanently without the
     * FIN, patronymic and date of birth every other part of the site asks for,
     * with no way to supply them.
     */
    const result =
      source === "google"
        ? saveGoogleProfile(user.email, {
            firstName: data.firstName,
            lastName: data.lastName,
            fatherName: data.fatherName,
            gender: data.gender,
            birthDate: data.birthDate,
            phone: data.phone,
            finCode: data.finCode,
          })
        : updateProfile(data)
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

  const missing = missingProfileFields(user)
  const orders = ordersFor(allOrders, user.id)
  const isGoogle = source === "google"

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

        {missing.length > 0 && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-5"
          >
            <p className="flex items-center gap-2 font-medium text-amber-900">
              <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              Profiliniz tamamlanmayıb
            </p>
            <p className="mt-1 text-sm text-amber-900/80">
              Sifariş vermək və qəbula yazılmaq üçün aşağıdakı məlumatlar
              tələb olunur — laboratoriya nümunəni bu məlumatlarla sizin adınıza
              qeyd edir.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {missing.map((field) => (
                <li
                  key={field.key}
                  className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900"
                >
                  {field.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Profil bölmələri">
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
            Qəbullarım ({appointments.length})
          </Button>
          <Button
            role="tab"
            id="tab-orders"
            aria-selected={activeTab === "orders"}
            aria-controls="panel-orders"
            variant={activeTab === "orders" ? "cta" : "outline"}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            Sifarişlərim ({orders.length})
          </Button>
          <Button
            role="tab"
            id="tab-results"
            aria-selected={activeTab === "results"}
            aria-controls="panel-results"
            variant={activeTab === "results" ? "cta" : "outline"}
            onClick={() => setActiveTab("results")}
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            Nəticələrim
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
                  {/* Only offered once nothing is missing — sending someone
                      back to a basket that would still refuse the order is
                      worse than keeping them here. */}
                  {saved && next && missing.length === 0 && (
                    <Button variant="cta" className="w-full" asChild>
                      <Link href={next}>Davam et</Link>
                    </Button>
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

                    {/* Locked for a Google session: the address is what Google
                        verified and what the session is keyed on, so editing it
                        here would either be silently ignored on the next sign-in
                        or split the account in two. Read-only rather than
                        disabled, so it stays focusable and readable. */}
                    <Field
                      label="Email"
                      required
                      hint={
                        isGoogle
                          ? "Google hesabınızdan alınır və dəyişdirilə bilmir."
                          : undefined
                      }
                      error={errors.email?.message}
                    >
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
                            readOnly={isGoogle}
                            aria-readonly={isGoogle || undefined}
                            {...register("email")}
                            className={`pl-10 ${
                              isGoogle
                                ? "cursor-not-allowed bg-[var(--secondary)] text-[var(--ink-muted)]"
                                : ""
                            } ${errors.email ? "border-red-500" : ""}`}
                          />
                          {isGoogle && (
                            <Lock
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                              aria-hidden="true"
                            />
                          )}
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
                      label="Doğum tarixi"
                      required
                      error={errors.birthDate?.message}
                    >
                      {(field) => (
                        <Input
                          {...field}
                          type="date"
                          autoComplete="bday"
                          {...register("birthDate")}
                          className={errors.birthDate ? "border-red-500" : ""}
                        />
                      )}
                    </Field>

                    <Field
                      label="FIN Kod"
                      required
                      hint="7 simvol — analiz nəticələri bu kodla tapılır. Kod filialda şəxsiyyət vəsiqəsi ilə üzləşdirilir."
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

        {activeTab === "orders" && (
          <div role="tabpanel" id="panel-orders" aria-labelledby="tab-orders">
            {orders.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-16 text-center">
                  <ShoppingBag
                    className="w-16 h-16 text-slate-300 mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <h2 className="text-lg font-semibold text-slate-700 mb-2">
                    Hələ sifarişiniz yoxdur
                  </h2>
                  <p className="text-slate-500 mb-6">
                    Laboratoriya xidmətlərini seçib sifariş verə bilərsiniz
                  </p>
                  <Button variant="cta" asChild>
                    <Link href="/xidmetler">Xidmətlərə bax</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-0 shadow-lg">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">
                            {formatDate(order.createdAt)}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {getBranchName(order.branch)} · {order.lines.length}{" "}
                            xidmət
                            {order.homeCollection && " · evdə qanalma"}
                            {" · "}
                            {order.paymentMethod === "CARD" ? "kart" : "nağd"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-step-1 text-primary">
                            {formatAzn(order.total)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reorder(order.id)}
                          >
                            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                            Təkrarla
                          </Button>
                        </div>
                      </div>

                      <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-[var(--line)] pt-4">
                        {order.lines.map((line) => (
                          <li
                            key={line.slug}
                            className="rounded-md bg-[var(--secondary)] px-2 py-1 text-xs text-[var(--ink)]"
                          >
                            {shortServiceName(line.name)}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}

                {/*
                  Said plainly and next to the orders themselves. There is no
                  server receiving these yet, so a list that looked like a
                  hospital record would have someone waiting at home for a call
                  that is never placed.
                */}
                <p className="flex items-start gap-2 text-xs text-slate-500">
                  <AlertCircle
                    className="mt-0.5 w-3.5 h-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  Sifarişlər hazırda yalnız bu brauzerdə saxlanılır və klinikaya
                  avtomatik göndərilmir. Təsdiq üçün{" "}
                  <a
                    href={telHref(contactInfo.phone)}
                    className="font-medium text-primary hover:underline"
                  >
                    {contactInfo.phone}
                  </a>{" "}
                  nömrəsi ilə əlaqə saxlayın.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "results" && (
          <div role="tabpanel" id="panel-results" aria-labelledby="tab-results">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Nəticələrim</CardTitle>
              </CardHeader>
              <CardContent>
                {/*
                  Signed in, the card number, date of birth and security code
                  are pointless: they exist to prove identity, and the account
                  has already done that. The lookup form stays for visitors who
                  are not signed in.
                */}
                <p className="text-sm text-[var(--ink-muted)]">
                  Nəticələr aşağıdakı məlumatlarla hesabınıza bağlanır. Kart
                  nömrəsi və təhlükəsizlik kodu tələb olunmur.
                </p>

                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-[var(--line)] p-3">
                    <dt className="text-xs text-[var(--ink-muted)]">FIN kod</dt>
                    <dd className="font-mono text-sm text-[var(--ink)]">
                      {user.finCode}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-[var(--line)] p-3">
                    <dt className="text-xs text-[var(--ink-muted)]">
                      Doğum tarixi
                    </dt>
                    <dd className="text-sm text-[var(--ink)]">
                      {user.birthDate ? formatDate(user.birthDate) : "-"}
                    </dd>
                  </div>
                </dl>

                {/*
                  An empty list would read as "you have no results", which to
                  someone waiting on a biopsy is a different and much worse
                  statement than "these cannot be shown here yet". Results live
                  in the laboratory system and nothing here can reach it.
                */}
                <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--secondary)] p-6 text-center">
                  <FileText
                    className="mx-auto mb-3 h-10 w-10 text-slate-400"
                    aria-hidden="true"
                  />
                  <p className="font-medium text-[var(--ink)]">
                    Nəticələr hələ bu səhifəyə gətirilmir
                  </p>
                  <p className="mx-auto mt-1 max-w-md text-sm text-[var(--ink-muted)]">
                    Analiz cavabları laboratoriya sistemində saxlanılır. Hazır
                    olduqda filialdan və ya çağrı mərkəzindən əldə edə
                    bilərsiniz.
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <a href={telHref(contactInfo.phone)}>
                      <Phone className="w-4 h-4" aria-hidden="true" />
                      {contactInfo.phone}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}

/**
 * useSearchParams needs a Suspense boundary, or the route opts out of static
 * rendering and the build fails outright.
 */
export default function ProfilPage() {
  return (
    <Suspense fallback={null}>
      <ProfilPageInner />
    </Suspense>
  )
}
