import HeroSection from "@/components/hero-section"
import DepartmentsSection from "@/components/departments-section"
import ServicesSection from "@/components/services-section"
import DoctorsSection from "@/components/doctors-section"
import BranchesSection from "@/components/branches-section"
import TestimonialsSection from "@/components/testimonials-section"

export default function Home() {
  return (
    <>
      <div id="hero"><HeroSection /></div>
      <div id="haqqimizda">
        <section className="py-16 md:py-24 bg-gradient-to-br from-teal-50 to-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Memorial Hospital <span className="text-primary">Haqqında</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  2009-cu ildən fəaliyyət göstərən Memorial Hospital, Bakının aparıcı tibbi mərkəzlərindən biridir. 
                  Müasir texnologiyalar və təcrübəli həkim heyəti ilə pasiyentlərimizə yüksək keyfiyyətli tibbi xidmət göstəririk.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Missiyamız — hər bir pasiyentin sağlamlığını qorumaq və onlara ən yaxşı tibbi xidməti təqdim etməkdir. 
                  3 filialımız, 50-dən çox həkimimiz və 15 ildən artıq təcrübəmizlə sizin xidmətinizdəyik.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">15+</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">İllik təcrübə</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">50+</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Təcrübəli həkim</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">3</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Filial</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">24/7</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Təcili yardım</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-teal-700 to-teal-500 rounded-3xl p-8 text-white shadow-2xl">
                  <h3 className="text-2xl font-bold mb-4">Niyə Memorial Hospital?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0 text-sm">✓</span>
                      <span>Müasir tibbi avadanlıqlar</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0 text-sm">✓</span>
                      <span>Təcrübəli həkim heyəti</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0 text-sm">✓</span>
                      <span>Rəqabətli qiymətlər</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0 text-sm">✓</span>
                      <span>24/7 təcili yardım</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0 text-sm">✓</span>
                      <span>Online qəbul sistemi</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div id="xidmetler"><DepartmentsSection /></div>
      <ServicesSection />
      <div id="hekimler"><DoctorsSection /></div>
      <div id="filiallar"><BranchesSection /></div>
      <TestimonialsSection />
      <div id="elaqe"></div>
    </>
  )
}
