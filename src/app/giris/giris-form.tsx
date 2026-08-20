"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircle, LogIn, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import GoogleAuthSection from "@/components/google-auth-section"
import AuthErrorNotice from "@/components/auth-error-notice"
import { contactInfo, telHref } from "@/data"

/**
 * Sign-in, Google only.
 *
 * The email/password form that used to be here was not authentication. It read
 * a password hash out of localStorage and compared it in the browser, so anyone
 * could sign in as anyone by editing one object in devtools — and the account
 * behind it now holds a FIN, a date of birth and a list of ordered tests, which
 * are health data. A login that can be walked past is worse than no login,
 * because it invites people to put real details behind it.
 *
 * Google is verified on Google's servers; the session that comes back is a JWT
 * signed with AUTH_SECRET in an httpOnly cookie the page cannot read or forge.
 * Until there is a server and a database of our own, it is the only honest
 * option here.
 */
export default function GirisForm({ googleEnabled }: { googleEnabled: boolean }) {
  /*
   * Where to land after signing in. Only same-site paths are honoured — taking
   * an arbitrary URL here would turn the login into an open redirect that could
   * bounce a patient to a look-alike site straight after authenticating.
   */
  const nextParam = useSearchParams().get("next")
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/profil"

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center py-16 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div
            className="w-16 h-16 bg-[var(--ink)] rounded-2xl flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Daxil Ol</h1>
          <p className="text-sm text-slate-500 mt-1">
            Hesabınıza Google ilə daxil olun
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <AuthErrorNotice />

          <GoogleAuthSection enabled={googleEnabled} callbackUrl={next} />

          {!googleEnabled && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Giriş hazırda əlçatan deyil. Zəhmət olmasa çağrı mərkəzimizlə
              əlaqə saxlayın.
            </div>
          )}

          <div className="rounded-lg border border-[var(--line)] bg-[var(--secondary)] p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Email və şifrə ilə giriş dayandırılıb
            </p>
            {/*
              Said plainly rather than quietly dropped. Someone who had an
              account here needs to know why it no longer opens, and the honest
              answer is that it never protected anything.
            */}
            <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">
              Əvvəlki giriş üsulu brauzerdə saxlanılan məlumatlara əsaslanırdı və
              kifayət qədər təhlükəsiz deyildi. Analiz nəticələri və şəxsi
              məlumatlar üçün yalnız server tərəfindən yoxlanılan giriş istifadə
              olunur.
            </p>
          </div>

          <p className="text-center text-sm text-slate-500">
            Hesabınızla bağlı sualınız var?{" "}
            <a
              href={telHref(contactInfo.phone)}
              className="font-medium text-primary hover:underline"
            >
              {contactInfo.phone}
            </a>
          </p>

          <p className="text-center text-xs text-slate-400">
            Davam etməklə{" "}
            <Link href="/sertler" className="underline hover:text-primary">
              İstifadə Şərtləri
            </Link>{" "}
            və{" "}
            <Link href="/siyaset" className="underline hover:text-primary">
              Məxfilik Siyasəti
            </Link>{" "}
            ilə razılaşırsınız.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
