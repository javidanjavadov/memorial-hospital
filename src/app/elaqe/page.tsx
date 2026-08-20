"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, textareaClass } from "@/components/ui/field"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle,
} from "lucide-react"
import { contactInfo, telHref } from "@/data"
import { createValidators } from "@/lib/validation"
import { useT } from "@/i18n/client"

const buildSchema = (t: ReturnType<typeof useT>) => {
  const v = createValidators(t.validation)
  return z.object({
    name: v.fullName,
    email: v.requiredEmail,
    phone: v.phoneNumber,
    message: z
      .string()
      .min(10, t.booking.messageTooShort)
      .max(2000, t.booking.messageTooLong),
  })
}

type FormData = z.infer<ReturnType<typeof buildSchema>>

export default function ElaqePage() {
  const t = useT()
  const schema = useMemo(() => buildSchema(t), [t])
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  })

  /**
   * There is no backend to post to. Rather than pretending the message was
   * delivered — the previous behaviour, which silently discarded everything —
   * the form hands the composed message to the visitor's mail client.
   */
  const onSubmit = (data: FormData) => {
    const subject = `Sayt müraciəti — ${data.name}`
    const body = [
      `Ad: ${data.name}`,
      `Email: ${data.email}`,
      `Telefon: ${data.phone}`,
      "",
      data.message,
    ].join("\n")

    window.location.assign(
      `mailto:${contactInfo.email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    )
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Əlaqə
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t.booking.contactSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{t.booking.writeToUs}</CardTitle>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle
                    className="w-16 h-16 text-green-500 mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    {t.booking.messagePrepared}
                  </h2>
                  <p className="text-slate-500 mb-4">
                    E-poçt proqramınızda mesaj açıldı — göndərməni orada
                    tamamlayın.
                  </p>
                  <p className="text-sm text-slate-500">
                    Proqram açılmadısa, bizə birbaşa yazın:{" "}
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-teal-700 font-semibold hover:underline"
                    >
                      {contactInfo.email}
                    </a>{" "}
                    və ya zəng edin{" "}
                    <a
                      href={telHref(contactInfo.phone)}
                      className="text-teal-700 font-semibold hover:underline"
                    >
                      {contactInfo.phone}
                    </a>
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setSent(false)}
                  >
                    Yeni mesaj yaz
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  <Field label="Ad Soyad" required error={errors.name?.message}>
                    {(field) => (
                      <Input
                        {...field}
                        autoComplete="name"
                        placeholder={t.booking.fullName}
                        {...register("name")}
                        className={errors.name ? "border-red-500" : ""}
                      />
                    )}
                  </Field>

                  <Field label="Email" required error={errors.email?.message}>
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

                  <Field label="Telefon" required error={errors.phone?.message}>
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

                  <Field
                    label="Mesaj"
                    required
                    hint="{t.booking.noHealthDataNote}"
                    error={errors.message?.message}
                  >
                    {(field) => (
                      <textarea
                        {...field}
                        rows={4}
                        maxLength={2000}
                        placeholder={t.booking.messagePlaceholder}
                        {...register("message")}
                        className={textareaClass}
                      />
                    )}
                  </Field>

                  <Button
                    type="submit"
                    variant="cta"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <Send className="w-5 h-5" aria-hidden="true" />
                    {t.booking.send}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-lg mb-4">{t.booking.contactDetails}</h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Telefon</h4>
                    <a href={telHref(contactInfo.phone)} className="text-teal-700 font-semibold">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Email</h4>
                    <a href={`mailto:${contactInfo.email}`} className="text-teal-700 font-semibold">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{t.booking.address}</h4>
                    <p className="text-slate-600">{t.data.contact.address ?? contactInfo.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{t.booking.workingHours}</h4>
                    <p className="text-slate-600">{t.data.contact.workingHours ?? contactInfo.workingHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 text-lg mb-4">{t.booking.socialNetworks}</h3>
                <div className="flex gap-3">
                  <a
                    href="https://api.whatsapp.com/send?phone=994557101050"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </a>
                  <a
                    href={telHref(contactInfo.phone)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    {t.booking.callUs}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
