"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle,
} from "lucide-react"
import { branches, contactInfo } from "@/data"

export default function ElaqePage() {
  const [sent, setSent] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-100/30 to-teal-100/50 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Əlaqə
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sualınız var? Bizimlə əlaqə saxlayın
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Bizə Yazın</CardTitle>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Mesajınız göndərildi!
                  </h3>
                  <p className="text-slate-500">
                    Tezliklə sizinlə əlaqə saxlayacağıq.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSent(true)
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Ad</label>
                      <Input placeholder="Adınız" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Soyad</label>
                      <Input placeholder="Soyadınız" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <Input type="email" placeholder="email@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Telefon</label>
                    <Input type="tel" placeholder="+994 XX XXX XX XX" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Mesaj</label>
                    <textarea
                      rows={4}
                      placeholder="Mesajınızı yazın..."
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      required
                    />
                  </div>
                  <Button type="submit" variant="cta" size="lg" className="w-full">
                    <Send className="w-5 h-5" />
                    Göndər
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-lg mb-4">Əlaqə Məlumatları</h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Telefon</h4>
                    <a href={`tel:${contactInfo.phone}`} className="text-teal-700 font-semibold">
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
                    <h4 className="font-medium text-slate-900">Ünvan</h4>
                    <p className="text-slate-600">{contactInfo.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">İş Vaxtı</h4>
                    <p className="text-slate-600">{contactInfo.workingHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 text-lg mb-4">Sosial Şəbəkələr</h3>
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
                    href={`tel:${contactInfo.phone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Zəng Edin
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
