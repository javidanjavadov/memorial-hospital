import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Məxfilik Siyasəti",
  description: "Memorial Hospital-ın məxfilik siyasəti və məlumatların qorunması.",
  path: "/siyaset",
})

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-50/30 to-teal-100/50 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Ana Səhifə
          </Link>
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
          Məxfilik Siyasəti
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <p className="text-slate-600">
            Son yenilənmə: 1 Yanvar 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">1. Ümumi Məlumat</h2>
            <p className="text-slate-600 leading-relaxed">
              Memorial Hospital olaraq şəxsi məlumatlarınızın qorunmasını prioritet hesab edirik. Bu Məxfilik Siyasəti, 
              bizim xidmətlərimizdən istifadə etdiyiniz zaman şəxsi məlumatlarınızın necə toplandığını, istifadə olunduğunu 
              və qorunduğunu açıqlayır.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">2. Toplanan Məlumatlar</h2>
            <p className="text-slate-600 leading-relaxed">Biz aşağıdakı məlumatları toplaya bilərik:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Ad, soyad, doğum tarixi</li>
              <li>Əlaqə məlumatları (telefon, email, ünvan)</li>
              <li>FIN kodu</li>
              <li>Sağlamlıq məlumatları (tibbi tarixçə, diaqnozlar, müalicələr)</li>
              <li>Sığorta məlumatları</li>
              <li>Online qəbul zamanı daxil etdiyiniz məlumatlar</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">3. Məlumatların İstifadəsi</h2>
            <p className="text-slate-600 leading-relaxed">Toplanan məlumatlar aşağıdakı məqsədlərlə istifadə olunur:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Tibbi xidmətlərin göstərilməsi</li>
              <li>Qəbul idarəsi və xatırlatma</li>
              <li>Faktura və ödəniş emalı</li>
              <li>Sizinlə əlaqə saxlanması</li>
              <li>Xidmət keyfiyyətinin yaxşılaşdırılması</li>
              <li>Qanuni tələblərə əməl edilməsi</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">4. Məlumatların Qorunması</h2>
            <p className="text-slate-600 leading-relaxed">
              Şəxsi məlumatlarınız şifrələnmiş serverlərdə saxlanılır və lazım olan təhlükəsizlik tədbirləri görülür.
              Məlumatlarınız yalnız səlahiyyətli personal tərəfindən giriş üçün açıqdır.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-amber-900">
                Bu saytın hazırkı versiyası barədə vacib qeyd
              </h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                Saytın bu versiyasında qeydiyyat və qəbul məlumatları <strong>serverə
                göndərilmir</strong> — onlar yalnız sizin brauzerinizin yaddaşında
                (localStorage) saxlanılır. Bu o deməkdir ki, məlumatlar həmin cihazda
                qalır və həmin cihaza girişi olan digər şəxslər tərəfindən görünə bilər.
                Ortaq və ya ictimai kompüterdən istifadə edirsinizsə, işiniz bitdikdən
                sonra hesabdan çıxın və brauzer məlumatlarını təmizləyin.
              </p>
              <p className="text-amber-800 text-sm leading-relaxed">
                Şifrələr açıq mətnlə deyil, PBKDF2 alqoritmi ilə heşlənmiş formada
                saxlanılır. Buna baxmayaraq, həssas sağlamlıq məlumatlarını bu formda
                daxil etməməyinizi tövsiyə edirik.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              4.1. Brauzer Yaddaşı (Cookie və localStorage)
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Sayt reklam və ya analitika məqsədilə üçüncü tərəf cookie-lərindən istifadə
              etmir. Yalnız aşağıdakı texniki yaddaş elementləri istifadə olunur:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>
                <code>memorial-auth</code> — aktiv sessiya (adınız, əlaqə məlumatlarınız,
                qəbullarınız)
              </li>
              <li>
                <code>memorial-users</code> — hesab məlumatları və heşlənmiş şifrə
              </li>
              <li>
                <code>memorial-appointments</code> — yaradılmış qəbul sorğuları
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Bu məlumatları brauzerinizin parametrlərindən istənilən vaxt silə bilərsiniz.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">5. Üçüncü Tərəflərlə Paylaşma</h2>
            <p className="text-slate-600 leading-relaxed">
              Şəxsi məlumatlarınız yalnız aşağıdakı hallarda üçüncü tərəflərlə paylaşılır:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Sizin açıq razılığınızla</li>
              <li>Qanuni tələblərə əməl etmək üçün</li>
              <li>Tibbi zərurət (digər tibb müəssisələri ilə konsultasiya)</li>
              <li>Sığorta şirkətləri ilə (sığorta hallarında)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">6. Hüquqlarınız</h2>
            <p className="text-slate-600 leading-relaxed">Siz aşağıdakı hüquqlara maliksiniz:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Şəxsi məlumatlarınıza giriş</li>
              <li>Şəxsi məlumatlarınızın düzəldilməsi</li>
              <li>Şəxsi məlumatlarınızın silinməsi</li>
              <li>Məlumatların daşınması</li>
              <li>Emala etiraz etmək</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">7. Əlaqə</h2>
            <p className="text-slate-600 leading-relaxed">
              Məxfilik siyasətimizlə bağlı suallarınız üçün bizimlə əlaqə saxlaya bilərsiniz:
            </p>
            <div className="bg-slate-50 rounded-xl p-6 space-y-2">
              <p className="text-slate-700"><strong>Email:</strong> info@memorialhospital.az</p>
              <p className="text-slate-700"><strong>Telefon:</strong> +994 55 710 10 50</p>
              <p className="text-slate-700"><strong>Ünvan:</strong> Bakı ş., Nərimanov r., Ü.Hacıbəyli küç. 42</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
