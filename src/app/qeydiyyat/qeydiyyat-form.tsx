"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Mail,
  Lock,
  Phone,
  User,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  Loader2,
} from "lucide-react"
import {
  fullName,
  optionalFinCode,
  password,
  phoneNumber,
  requiredEmail,
} from "@/lib/validation"
import { useAuthStore } from "@/lib/auth-store"
import GoogleAuthSection from "@/components/google-auth-section"

const schema = z
  .object({
    fullName,
    email: requiredEmail,
    phone: phoneNumber,
    // `optionalFinCode` maps "" -> undefined; a plain `.optional()` would
    // reject the empty string and block registration on an optional field.
    finCode: optionalFinCode,
    password,
    confirmPassword: z.string().min(1, "Şifrəni təkrar daxil edin"),
    consent: z.literal(true, {
      message: "Davam etmək üçün məxfilik siyasəti ilə razılaşmalısınız",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifrələr uyğun gəlmir",
    path: ["confirmPassword"],
  })

// `z.input` is what the fields hand over (optional values may be ""), `z.output`
// is what the resolver produces after normalisation. Keeping them separate is
// what lets an optional field accept an empty string.
type FormInput = z.input<typeof schema>
type FormData = z.output<typeof schema>

export default function QeydiyyatPage({ googleEnabled }: { googleEnabled: boolean }) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const registerUser = useAuthStore((s) => s.register)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      finCode: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setError("")
    const result = await registerUser({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      finCode: data.finCode,
      password: data.password,
    })
    if (result.ok) {
      router.push("/profil")
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-100/30 to-teal-100/50 flex items-center justify-center py-16 px-4">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div
            className="w-16 h-16 bg-gradient-to-br from-teal-700 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Qeydiyyatdan Keçin</h1>
          <p className="text-sm text-slate-500 mt-1">Yeni hesab yaradın</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            <GoogleAuthSection enabled={googleEnabled} label="Google ilə qeydiyyatdan keç" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Ad Soyad"
                required
                error={errors.fullName?.message}
                className="sm:col-span-2"
              >
                {(field) => (
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                      aria-hidden="true"
                    />
                    <Input
                      {...field}
                      autoComplete="name"
                      placeholder="Adınız və soyadınız"
                      {...register("fullName")}
                      className={`pl-10 ${errors.fullName ? "border-red-500" : ""}`}
                    />
                  </div>
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
                      placeholder="email@example.com"
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
                      placeholder="+994 XX XXX XX XX"
                      {...register("phone")}
                      className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                    />
                  </div>
                )}
              </Field>

              <Field
                label="FIN Kod"
                hint="İxtiyari — şəxsiyyət vəsiqənizdəki 7 simvol."
                error={errors.finCode?.message}
                className="sm:col-span-2"
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

              <Field
                label="Şifrə"
                required
                hint="Minimum 8 simvol, ən azı bir hərf və bir rəqəm."
                error={errors.password?.message}
              >
                {(field) => (
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                      aria-hidden="true"
                    />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...register("password")}
                      className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 rounded"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <Eye className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                )}
              </Field>

              <Field
                label="Şifrə Təkrar"
                required
                error={errors.confirmPassword?.message}
              >
                {(field) => (
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                      aria-hidden="true"
                    />
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    />
                  </div>
                )}
              </Field>
            </div>

            {/* Explicit consent — the privacy policy promises it, so the form
                has to actually collect it. */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input
                  id="consent"
                  type="checkbox"
                  {...register("consent")}
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={errors.consent ? "consent-error" : undefined}
                  className="mt-1 w-4 h-4 shrink-0 accent-teal-700"
                />
                <label htmlFor="consent" className="text-sm text-slate-600">
                  <Link
                    href="/siyaset"
                    className="text-teal-700 font-medium hover:underline"
                  >
                    Məxfilik siyasəti
                  </Link>{" "}
                  və{" "}
                  <Link
                    href="/sertler"
                    className="text-teal-700 font-medium hover:underline"
                  >
                    istifadə şərtləri
                  </Link>{" "}
                  ilə tanış oldum və şəxsi məlumatlarımın emalına razıyam.
                </label>
              </div>
              {errors.consent && (
                <p id="consent-error" role="alert" className="text-sm text-red-500">
                  {errors.consent.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="cta"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="w-5 h-5" aria-hidden="true" />
              )}
              {isSubmitting ? "Yaradılır..." : "Qeydiyyatdan Keç"}
            </Button>

            <div className="text-center text-sm text-slate-500">
              Artıq hesabınız var?{" "}
              <Link
                href="/giris"
                className="text-teal-700 font-semibold hover:underline"
              >
                Daxil olun
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
