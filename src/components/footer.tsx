"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ArrowUp,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/client"
import { YEARS_OF_EXPERIENCE, branches, contactInfo, departments, telHref } from "@/data"
import { localizeBranch, localizeDepartment } from "@/i18n/data"

export default function Footer() {
  const t = useT()

  return (
    <footer className="bg-[var(--ink)] text-white">
      {/* Pre Footer CTA */}
      <div className="bg-[var(--ink)]">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                {t.footer.ctaTitle}
              </h3>
              <p className="text-white/90 mt-2">
                {t.footer.ctaBody}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outlineOnDark"
                size="lg"
                asChild
              >
                <a href={telHref(contactInfo.phone)}>
                  <Phone className="w-5 h-5" />
                  {t.footer.callUs}
                </a>
              </Button>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link href="/qebul">
                  <Calendar className="w-5 h-5" />
                  {t.nav.bookAppointment}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
              <Image
                src="/logo.svg"
                alt="Memorial Hospital"
                width={144}
                height={50}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t.footer.tagline}
              {t.f(t.footer.experienceNote, { years: YEARS_OF_EXPERIENCE })}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/MemorialHospital.az"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook səhifəmiz (yeni pəncərədə açılır)"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/memorialhospital.az/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram səhifəmiz (yeni pəncərədə açılır)"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=994557101050"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp ilə yazın (yeni pəncərədə açılır)"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-green-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Departments Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t.footer.departments}</h4>
            <ul className="space-y-3">
              {departments.slice(0, 6).map((raw) => {
                const dept = localizeDepartment(raw, t.data)
                return (
                <li key={dept.id}>
                  <Link
                    href={`/xidmetler#${dept.id}`}
                    className="text-slate-400 hover:text-white text-sm transition-all duration-200 flex items-center gap-2 hover:translate-x-1"
                  >
                    <dept.icon className="w-4 h-4 text-primary" />
                    {dept.name}
                  </Link>
                </li>
                )
              })}
            </ul>
          </div>

          {/* Branches Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t.footer.ourBranches}</h4>
            <ul className="space-y-4">
              {branches.map((raw) => {
                const branch = localizeBranch(raw, t.data)
                return (
                <li key={branch.id}>
                  <Link
                    href={`/filiallar#${branch.id}`}
                    className="group"
                  >
                    <h5 className="text-sm font-medium text-white group-hover:text-primary transition-colors duration-200">
                      {branch.name}
                    </h5>
                    <p className="text-slate-400 text-xs mt-1">{branch.address}</p>
                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {branch.phone}
                    </p>
                  </Link>
                </li>
                )
              })}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t.footer.contact}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <a
                    href={telHref(contactInfo.phone)}
                    className="text-sm text-white hover:text-primary transition-colors block"
                  >
                    {contactInfo.phone}
                  </a>
                  <span className="text-xs text-slate-400">{t.footer.mainLine}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-sm text-white hover:text-primary transition-colors"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-400">{t.data.contact.address ?? contactInfo.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-400">{t.data.contact.workingHours ?? contactInfo.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm text-center md:text-left">
              {/* Scoped suppression: the prerendered year and the client's year
                  differ only across a New Year boundary, and only here. */}
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
              Memorial Hospital. {t.footer.rightsReserved}.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <Link href="/siyaset" className="hover:text-white transition-colors duration-200">
                {t.footer.privacyPolicy}
              </Link>
              <span>|</span>
              <Link href="/sertler" className="hover:text-white transition-colors duration-200">
                {t.footer.termsOfUse}
              </Link>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-10 h-10 rounded-full bg-accent hover:bg-accent/90 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
              aria-label={t.footer.scrollTop}
            >
              <ArrowUp className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
