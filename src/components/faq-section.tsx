"use client"

import Link from "next/link"
import { ChevronDown, MessageCircleQuestion } from "lucide-react"
import { AnimateOnScroll } from "@/components/animations"
import { contactInfo, telHref } from "@/data"
import { useT } from "@/i18n/client"

/**
 * Frequently asked questions, straight from the hospital's own published
 * answers.
 *
 * Built on native <details>/<summary> rather than a JS accordion: it works
 * before hydration and without scripts, the browser handles keyboard and
 * screen-reader semantics, and in-page search (Ctrl+F) can find text inside a
 * collapsed answer.
 */
export default function FaqSection() {
  const t = useT()
  return (
    <section className="py-16 md:py-24 bg-[var(--paper)]">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary mb-3">
              SUALLAR
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t.home.faqTitle}
            </h2>
            <p className="text-lg text-slate-600">
              {t.home.faqSubtitle}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="max-w-3xl mx-auto space-y-3">
          {t.data.faq.map((faq, index) => (
            <AnimateOnScroll key={faq.question} delay={index * 60}>
              <details className="group rounded-xl border border-slate-200 bg-white transition-colors hover:border-primary/40 open:border-primary/40">
                <summary className="flex cursor-pointer items-start gap-3 p-5 font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                  <MessageCircleQuestion
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown
                    className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="px-5 pb-5 pl-13">
                  <p className="leading-relaxed text-slate-600">{faq.answer}</p>
                </div>
              </details>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={200}>
          <div className="mx-auto mt-10 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-slate-600">
              Sualınıza cavab tapmadınız?{" "}
              <a
                href={telHref(contactInfo.phone)}
                className="font-semibold text-primary hover:underline"
              >
                {contactInfo.phone}
              </a>{" "}
              nömrəsi ilə çağrı mərkəzimizə zəng edin və ya{" "}
              <Link
                href="/elaqe"
                className="font-semibold text-primary hover:underline"
              >
                {t.home.faqWriteToUs}
              </Link>
              .
            </p>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
