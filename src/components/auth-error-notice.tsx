"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"

/**
 * Auth.js reports a failed sign-in by redirecting to `pages.signIn` with an
 * `?error=` code. Without this the visitor is bounced back to a pristine login
 * form with no indication that anything went wrong.
 *
 * Codes: https://authjs.dev/reference/core/errors
 */
const MESSAGES: Record<string, string> = {
  Configuration:
    "Giriş konfiqurasiyasında problem var. Zəhmət olmasa administratora müraciət edin.",
  AccessDenied:
    "Giriş icazəsi verilmədi. Tətbiq hazırda sınaq rejimindədir — hesabınız test istifadəçiləri siyahısına əlavə olunmalıdır.",
  Verification: "Bu giriş linkinin vaxtı bitib və ya artıq istifadə olunub.",
  OAuthSignin: "Google-a yönləndirmə alınmadı. Yenidən cəhd edin.",
  OAuthCallback: "Google-dan qayıdarkən xəta baş verdi. Yenidən cəhd edin.",
  OAuthAccountNotLinked:
    "Bu email artıq başqa üsulla qeydiyyatdan keçib. Əvvəlki üsulla daxil olun.",
  Callback: "Giriş tamamlanmadı. Yenidən cəhd edin.",
  default: "Giriş zamanı gözlənilməz xəta baş verdi. Yenidən cəhd edin.",
}

function Notice() {
  const error = useSearchParams().get("error")
  if (!error) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span>{MESSAGES[error] ?? MESSAGES.default}</span>
    </div>
  )
}

export default function AuthErrorNotice() {
  // useSearchParams needs a boundary so the rest of the page can stay static.
  return (
    <Suspense fallback={null}>
      <Notice />
    </Suspense>
  )
}
