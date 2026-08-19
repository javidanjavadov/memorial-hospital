import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "İstifadə Şərtləri | Memorial Hospital",
  description: "Memorial Hospital-ın istifadə şərtləri",
}

export default function TermsPage() {
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
          İstifadə Şərtləri
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <p className="text-slate-600">
            Son yenilənmə: 1 Yanvar 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">1. Ümumi Şərtlər</h2>
            <p className="text-slate-600 leading-relaxed">
              Bu İstifadə Şərtləri Memorial Hospital-ın rəsmi vebsaytından və online xidmətlərindən 
              istifadə qaydalarını müəyyən edir. Saytdan istifadə etməklə siz bu şərtləri qəbul etmiş olursunuz.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">2. Xidmətlər</h2>
            <p className="text-slate-600 leading-relaxed">
              Memorial Hospital online qəbul sistemi, tibbi məlumatlar və digər rəqəmsal xidmətlər təqdim edir. 
              Online qəbul yalnız məlumatlandırma məqsədlidir və təcili hallarda birbaşa əlaqə saxlamağınız tövsiyə olunur.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">3. İstifadəçi Öhdəlikləri</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Doğru və tam məlumat təqdim etmək</li>
              <li>Hesab məlumatlarının məxfiliyini qorumaq</li>
              <li>Qanunsuz məqsədlərlə xidmətdən istifadə etməmək</li>
              <li>Başqa istifadəçilərin hüquqlarına hörmət etmək</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">4. Cavabdehlik</h2>
            <p className="text-slate-600 leading-relaxed">
              Memorial Hospital vebsaytında verilən tibbi məlumatlar yalnız məlumatlandırma məqsədlidir 
              və həkim məsləhəti əvəzini tutmur. Hər hansı tibbi qərar qəbul etməzdən əvvəl həkiminizlə 
              məsləhətləşməyinizi tövsiyə edirik.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">5. Intellektual Mülkiyyət</h2>
            <p className="text-slate-600 leading-relaxed">
              Saytdakı bütün məzmun, dizayn, loqo və digər materiallar Memorial Hospital-ın intellektual 
              mülkiyyətidir və qanunla qorunur.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">6. Şərtlərə Dəyişiklik</h2>
            <p className="text-slate-600 leading-relaxed">
              Memorial Hospital bu şərtləri istənilən vaxt dəyişdirmək hüququna malikdir. Dəyişikliklər 
              saytda dərc olunduqdan sonra qüvvəyə minir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">7. Əlaqə</h2>
            <p className="text-slate-600 leading-relaxed">
              İstifadə şərtləri ilə bağlı suallarınız üçün bizimlə əlaqə saxlaya bilərsiniz:
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
