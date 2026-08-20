import Link from "next/link"
import { ClipboardList, ShieldCheck, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import GoogleAuthSection from "@/components/google-auth-section"
import { googleConfigured } from "@/lib/auth-flags"
import { contactInfo, telHref } from "@/data"
import { getDictionary } from "@/i18n"

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
export default async function QeydiyyatPage() {
  const t = await getDictionary()

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
          <h1 className="text-2xl font-bold text-slate-900">{t.meta.signUp.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t.ui.twoSteps}
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
                <strong className="block">{t.ui.createWithGoogle}</strong>
                <span className="text-xs text-[var(--ink-muted)]">
                  {t.ui.noPasswordsStored}
                </span>
              </span>
            </li>
            <li className="flex gap-3 rounded-lg border border-[var(--line)] p-3">
              <ClipboardList
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="text-sm text-[var(--ink)]">
                <strong className="block">{t.ui.completeYourDetails}</strong>
                <span className="text-xs text-[var(--ink-muted)]">
{t.ui.detailsList}
                </span>
              </span>
            </li>
          </ol>

          <GoogleAuthSection enabled={googleConfigured} callbackUrl="/profil" />

          <p className="text-center text-sm text-slate-500">
            {t.ui.haveAccount}{" "}
            <Link href="/giris" className="font-medium text-primary hover:underline">
              {t.meta.signIn.title}
            </Link>
          </p>

          <p className="text-center text-sm text-slate-500">
            {t.ui.needHelp}{" "}
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
