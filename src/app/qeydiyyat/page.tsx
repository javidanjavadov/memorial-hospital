import Link from "next/link"
import { ClipboardList, ShieldCheck, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import GoogleAuthSection from "@/components/google-auth-section"
import { googleConfigured } from "@/lib/auth-flags"
import { contactInfo, telHref } from "@/data"

/**
 * Registration is now: sign in with Google, then complete the details Google
 * cannot supply.
 *
 * The form that stood here created an account in localStorage, hashed the
 * password in the browser and checked it there too — so the account protected
 * nothing, while collecting a FIN and a date of birth. Rather than keep a
 * sign-up that hands real identity documents to a fake lock, the account is
 * Google's and the patient details are validated and stored server-side.
 */
export default function QeydiyyatPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center py-16 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="pb-2 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--ink)]"
            aria-hidden="true"
          >
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Qeydiyyat</h1>
          <p className="mt-1 text-sm text-slate-500">
            İki addım — hesab, sonra pasiyent məlumatları
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <ol className="space-y-3">
            <li className="flex gap-3 rounded-lg border border-[var(--line)] p-3">
              <ShieldCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="text-sm text-[var(--ink)]">
                <strong className="block">Google ilə hesab yaradın</strong>
                <span className="text-xs text-[var(--ink-muted)]">
                  Şifrə saxlamırıq — giriş Google tərəfindən yoxlanılır.
                </span>
              </span>
            </li>
            <li className="flex gap-3 rounded-lg border border-[var(--line)] p-3">
              <ClipboardList
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="text-sm text-[var(--ink)]">
                <strong className="block">Məlumatlarınızı tamamlayın</strong>
                <span className="text-xs text-[var(--ink-muted)]">
                  Ad, soyad, ata adı, cins, doğum tarixi, FIN və telefon.
                  Laboratoriya nümunəni bu məlumatlarla qeyd edir.
                </span>
              </span>
            </li>
          </ol>

          <GoogleAuthSection enabled={googleConfigured} callbackUrl="/profil" />

          <p className="text-center text-sm text-slate-500">
            Artıq hesabınız var?{" "}
            <Link href="/giris" className="font-medium text-primary hover:underline">
              Daxil olun
            </Link>
          </p>

          <p className="text-center text-sm text-slate-500">
            Kömək lazımdır?{" "}
            <a
              href={telHref(contactInfo.phone)}
              className="font-medium text-primary hover:underline"
            >
              {contactInfo.phone}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
