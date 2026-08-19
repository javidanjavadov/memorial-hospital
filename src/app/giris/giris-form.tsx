"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from "lucide-react"
import { requiredEmail } from "@/lib/validation"
import { useAuthStore } from "@/lib/auth-store"
import GoogleAuthSection from "@/components/google-auth-section"
import AuthErrorNotice from "@/components/auth-error-notice"

const schema = z.object({
  email: requiredEmail,
  // Deliberately not the strict registration rule: existing accounts must stay
  // able to sign in, and a strength hint here would leak policy details.
  password: z.string().min(1, "Şifrəni daxil edin"),
})

type FormData = z.infer<typeof schema>

export default function GirisPage({ googleEnabled }: { googleEnabled: boolean }) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const user = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  // Already signed in — no reason to show the form again.
  useEffect(() => {
    if (hasHydrated && user) router.replace("/profil")
  }, [hasHydrated, user, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: FormData) => {
    setError("")
    const result = await login(data.email, data.password)
    if (result.ok) {
      router.push("/profil")
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-100/30 to-teal-100/50 flex items-center justify-center py-16 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div
            className="w-16 h-16 bg-gradient-to-br from-teal-700 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Daxil Ol</h1>
          <p className="text-sm text-slate-500 mt-1">Hesabınıza daxil olun</p>
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

            <AuthErrorNotice />

            <GoogleAuthSection enabled={googleEnabled} />

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

            <Field label="Şifrə" required error={errors.password?.message}>
              {(field) => (
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
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
                <LogIn className="w-5 h-5" aria-hidden="true" />
              )}
              {isSubmitting ? "Yoxlanılır..." : "Daxil Ol"}
            </Button>

            <div className="text-center text-sm text-slate-500">
              Hesabınız yoxdur?{" "}
              <Link
                href="/qeydiyyat"
                className="text-teal-700 font-semibold hover:underline"
              >
                Qeydiyyatdan keçin
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
