import {
  branches,
  contactInfo,
  doctors,
  FOUNDED_YEAR,
  telHref,
  YEARS_OF_EXPERIENCE,
} from "@/data"
import { AnimateOnScroll } from "@/components/animations"
import HeroSection from "@/components/hero-section"
import FindDoctorSection from "@/components/find-doctor-section"
import DepartmentsSection from "@/components/departments-section"
import ServicesSection from "@/components/services-section"
import DoctorsSection from "@/components/doctors-section"
import BranchesSection from "@/components/branches-section"
import TrustSection from "@/components/trust-section"
import AccreditationSection from "@/components/accreditation-section"
import AccreditationBar from "@/components/accreditation-bar"
import FaqSection from "@/components/faq-section"

export default function Home() {
  return (
    <>
      {/*
        One screen, whatever the screen is: the sticky header, the photograph
        and the accreditation bar together come to exactly 100svh, so IAS,
        RIQAS and QCMD are visible without scrolling on any monitor rather than
        at a height that happened to suit one.

        `svh` not `vh` — on mobile `vh` measures the viewport with the browser
        chrome hidden, so the block would run taller than the screen.

        `min-h`, not a fixed height: on a short screen it grows instead of
        crushing the hero or clipping the bar.
      */}
      <div id="hero" className="-mt-16 flex min-h-[100svh] flex-col md:-mt-20">
        <HeroSection />
        <AccreditationBar />
      </div>
      <ServicesSection />
      <div id="haqqimizda">
        <section className="py-16 md:py-24 bg-[var(--paper)]">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimateOnScroll animation="left">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Memorial Hospital <span className="text-primary">Haqqında</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {FOUNDED_YEAR}-cu ildən fəaliyyət göstərən Memorial Hospital, Bakının aparıcı tibbi mərkəzlərindən biridir. 
                  Müasir texnologiyalar və təcrübəli həkim heyəti ilə pasiyentlərimizə yüksək keyfiyyətli tibbi xidmət göstəririk.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Missiyamız — hər bir pasiyentin sağlamlığını qorumaq və onlara ən yaxşı tibbi xidməti təqdim etməkdir. 
                  {branches.length} filialımız, {doctors.length} həkimimiz və {YEARS_OF_EXPERIENCE} ildən
                  artıq təcrübəmizlə sizin xidmətinizdəyik.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">{YEARS_OF_EXPERIENCE}+</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">İllik təcrübə</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {doctors.length}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Təcrübəli həkim</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {branches.length}
                      </span>
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
              </AnimateOnScroll>
              <AnimateOnScroll animation="right" delay={150}>
              <div className="relative">
                <div className="bg-[var(--ink)] rounded-3xl p-8 text-white shadow-2xl">
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
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      </div>
      <div id="xidmetler"><DepartmentsSection /></div>
      <AccreditationSection />
      <FindDoctorSection />
      <div id="hekimler"><DoctorsSection /></div>
      <div id="filiallar"><BranchesSection /></div>
      <TrustSection />
      <div id="suallar"><FaqSection /></div>
      <div id="elaqe">
        <section className="py-16 md:py-24 bg-[var(--paper)]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Bizimlə <span className="text-primary">Əlaqə</span> Saxlayın
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Sualınız var? Bizimlə əlaqə saxlayın, kömək edək
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Zəng Edin</h3>
                <a href={telHref(contactInfo.phone)} className="text-primary font-medium hover:underline">+994 55 710 10 50</a>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Ünvanımız</h3>
                <p className="text-sm text-slate-600">Bakı ş., Nərimanov r., Ü.Hacıbəyli küç. 42</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">İş Vaxtı</h3>
                <p className="text-sm text-slate-600">B.e - Cümə: 08:00 - 20:00</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
