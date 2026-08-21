"use client"

import { useCallback, useState, useMemo } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  AlertCircle,
  FileText,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
} from "lucide-react"
import { useCurrentUser } from "@/lib/use-current-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { contactInfo, telHref } from "@/data"
import Captcha, { type CaptchaHandle } from "@/components/captcha"
import {
  CARD_NO_PATTERN,
  lookupResults,
  type ResultOrder,
} from "@/lib/results"
import { useT } from "@/i18n/client"

/* Built from the dictionary: zod bakes messages in at construction, so a
   module-level schema could only ever speak one language. */
const buildSchema = (t: ReturnType<typeof useT>) =>
  z.object({
    // One field, exactly as the report prints it.
    cardNo: z
      .string()
      .min(1, t.booking.cardNoRequired)
      .regex(CARD_NO_PATTERN, t.booking.cardNoFormat),
    birthDate: z
      .string()
      .min(1, t.booking.selectBirthDate)
      .refine((v) => {
        const d = new Date(v)
        return !Number.isNaN(d.valueOf()) && d < new Date()
      }, t.booking.invalidBirthDate),
    securityCode: z.string().min(1, t.booking.enterSecurityCode),
  })

type FormData = z.infer<ReturnType<typeof buildSchema>>

export default function NeticelerPage() {
  const t = useT()
  const schema = useMemo(() => buildSchema(t), [t])
  /*
   * This lookup exists for visitors who have no account: it proves identity
   * with the card number, date of birth and security code printed on the
   * report. A signed-in visitor has already proved it, so asking again is
   * asking them to go and find a piece of paper for no reason.
   */
  const { user, isLoading } = useCurrentUser()

  const [error, setError] = useState("")
  const [order, setOrder] = useState<ResultOrder | null>(null)

  /* State rather than a ref: the submit handler is created during render, and
   * reading a ref from there is exactly what the refs lint rule warns about.
   * The handle is set once, so this costs a single extra render. */
  const [captcha, setCaptcha] = useState<CaptchaHandle | null>(null)
  const onCaptchaReady = useCallback((handle: CaptchaHandle) => {
    setCaptcha(handle)
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cardNo: "", birthDate: "", securityCode: "" },
  })

  const onSubmit = async (data: FormData) => {
    setError("")
    setOrder(null)

    if (!captcha?.verify(data.securityCode)) {
      captcha?.refresh()
      setValue("securityCode", "")
      setError(t.booking.wrongSecurityCode)
      return
    }

    const outcome = await lookupResults({
      cardNo: data.cardNo,
      birthDate: data.birthDate,
    })
    if (outcome.ok) setOrder(outcome.order)
    else {
      // A fresh challenge after every attempt, so a failed lookup cannot be
      // retried in a loop against one solved code.
      captcha?.refresh()
      setValue("securityCode", "")
      // The lookup returns a key; the wording belongs here.
      setError(t.ui[outcome.error])
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status">
        <span className="text-[var(--ink-muted)]">{t.common.loading}</span>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-[var(--paper)] py-14 md:py-20">
        <div className="container mx-auto max-w-lg px-4 text-center">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
            aria-hidden="true"
          >
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-step-2 text-[var(--ink)]">
            {t.booking.resultsLinkedTitle}
          </h1>
          <p className="mt-3 text-[var(--ink-muted)]">
{t.booking.resultsLinkedBody}
          </p>
          <Button variant="cta" size="lg" className="mt-6" asChild>
            <Link href="/profil?tab=results">{t.booking.myResults}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl">
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-2 text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
                aria-hidden="true"
              >
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-step-2 text-[var(--ink)]">
                {t.booking.resultsTitle}
              </h1>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                {t.booking.resultsSubtitle}
              </p>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
              >
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    {error}
                  </div>
                )}

                <Field
                  label={t.results.cardNo}
                  required
                  hint={t.booking.cardNoHint}
                  error={errors.cardNo?.message}
                >
                  {(field) => (
                    <Input
                      {...field}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="00000000-0000000000"
                      {...register("cardNo")}
                      className={`font-mono ${errors.cardNo ? "border-red-500" : ""}`}
                    />
                  )}
                </Field>

                <Field
                  label={t.booking.birthDate}
                  required
                  error={errors.birthDate?.message}
                >
                  {(field) => (
                    <Input
                      {...field}
                      type="date"
                      {...register("birthDate")}
                      className={errors.birthDate ? "border-red-500" : ""}
                    />
                  )}
                </Field>

                <Field
                  label={t.booking.securityCode}
                  required
                  error={errors.securityCode?.message}
                >
                  {(field) => (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="relative flex-1">
                        <Lock
                          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                          aria-hidden="true"
                        />
                        <Input
                          {...field}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder={t.booking.enterSecurityCode}
                          {...register("securityCode")}
                          className={`pl-10 uppercase ${errors.securityCode ? "border-red-500" : ""}`}
                        />
                      </div>
                      <Captcha onReady={onCaptchaReady} />
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
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  )}
                  {isSubmitting ? t.booking.checking : t.booking.showResult}
                </Button>

                <p className="flex items-start gap-2 text-xs text-[var(--ink-muted)]">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {t.results.privacyNote}
                </p>
              </form>

              {order && (
                <div className="mt-8 border-t border-[var(--line)] pt-6">
                  <h2 className="font-display text-step-1 text-[var(--ink)]">
                    {order.patientName}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    Sifariş {order.orderId} · {order.reportedAt}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {order.lines.map((line) => (
                      <li
                        key={line.code}
                        className="flex items-baseline justify-between gap-4 rounded-lg border border-[var(--line)] p-3"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm text-[var(--ink)]">
                            {line.name}
                          </span>
                          <span className="block text-xs text-[var(--ink-muted)]">
                            Referans: {line.referenceRange} {line.unit}
                          </span>
                        </span>
                        <span
                          className={
                            line.abnormal
                              ? "font-semibold text-red-600"
                              : "font-semibold text-[var(--ink)]"
                          }
                        >
                          {line.value} {line.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-5 text-center">
            <p className="text-sm text-[var(--ink-muted)]">
              Məlumatlarınızı tapa bilmirsiniz?{" "}
              <a
                href={telHref(contactInfo.phone)}
                className="font-semibold text-primary hover:underline"
              >
                {contactInfo.phone}
              </a>{" "}
              nömrəsinə zəng edin və ya{" "}
              <Link href="/elaqe" className="font-semibold text-primary hover:underline">
                {t.home.faqWriteToUs}
              </Link>
              .
            </p>
          </div>

          <p className="mt-4 flex items-start gap-2 text-center text-xs text-[var(--ink-muted)]">
            <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t.booking.resultsNotifyNote}
          </p>
        </div>
      </div>
    </div>
  )
}
