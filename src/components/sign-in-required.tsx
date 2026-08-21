"use client"

import Link from "next/link"
import { LogIn, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useT } from "@/i18n/client"

/**
 * The screen a signed-out visitor gets where an account is required.
 *
 * Shown in place of the form rather than as a redirect to /giris: the visitor
 * asked for this page, and bouncing them to a sign-in screen loses both what
 * they were doing and the explanation of why they cannot do it. `next` brings
 * them back here afterwards.
 *
 * Booking needs an account now because an appointment is filed against a
 * patient — the account holder or one of their relatives — and a guest has
 * neither. The relatives live on the account, so there is nothing to choose
 * from until someone signs in.
 */
export default function SignInRequired({
  title,
  body,
  next,
}: {
  title: string
  body: string
  /** Same-site path to return to. */
  next: string
}) {
  const t = useT()

  return (
    <div className="min-h-screen bg-[var(--paper)] py-16 md:py-24">
      <div className="container mx-auto px-4">
        <Card className="mx-auto max-w-md border-0 shadow-lg">
          <CardContent className="px-6 py-10 text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
              aria-hidden="true"
            >
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>

            <h1 className="font-display text-step-2 text-[var(--ink)]">{title}</h1>
            <p className="mt-3 text-[var(--ink-muted)]">{body}</p>

            <div className="mt-8 flex flex-col gap-3">
              <Button variant="cta" size="lg" asChild>
                <Link href={`/giris?next=${encodeURIComponent(next)}`}>
                  <LogIn className="h-5 w-5" aria-hidden="true" />
                  {t.nav.signIn}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/qeydiyyat?next=${encodeURIComponent(next)}`}>
                  {t.auth.signUpTitle}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
