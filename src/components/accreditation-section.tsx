"use client"

import Image from "next/image"
import { AnimateOnScroll } from "@/components/animations"
import { accreditations } from "@/data/accreditations"
import { useT } from "@/i18n/client"
import { localizeAccreditation } from "@/i18n/data"

/**
 * Laboratory accreditation and external quality assessment.
 *
 * These are the strongest trust signals the hospital has and they appeared
 * nowhere on the site, even though the printed reports carry them. RIQAS and
 * QCMD participation is stated on the report footer under "XARICI KEYFİYYƏTƏ
 * NƏZARƏT"; the IAS accreditation is the laboratory's own.
 *
 * Every claim here is a verifiable fact about the laboratory — nothing is
 * padded out with invented awards.
 */

export default function AccreditationSection() {
  const t = useT()
  return (
    <section id="akkreditasiya" className="scroll-mt-24 bg-[var(--ink)] py-16 text-white md:py-24">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="mb-14 max-w-3xl text-center md:mx-auto">
            <p className="mb-4 text-sm tracking-[0.2em] text-[var(--accent)] uppercase">
              {t.home.accreditationEyebrow}
            </p>
            <h2 className="font-display text-step-4">
              {t.home.accreditationTitle}
            </h2>
            <p className="mt-5 text-step-1 text-white/70">
{t.home.accreditationSubtitle}
            </p>
          </div>

          {/*
            The three marks set large and on their own line. These are the
            laboratory's strongest credentials and they read as a wordmark
            first, explanation second — the card text below carries the detail.
          */}
          <ul className="mb-14 flex flex-wrap items-center justify-center gap-4 border-y border-white/15 py-8 sm:gap-6">
            {accreditations.map((raw) => {
            const item = localizeAccreditation(raw, t.data)
            return (
              <li
                key={`mark-${item.label}`}
                className="flex h-20 items-center rounded-xl bg-white px-6"
              >
                <Image
                  src={item.logo}
                  alt={`${item.mark} — ${item.markNote}`}
                  width={item.logoWidth}
                  height={item.logoHeight}
                  className="h-10 w-auto object-contain sm:h-12"
                />
              </li>
              )
            })}
          </ul>
        </AnimateOnScroll>

        <ul className="grid gap-4 md:grid-cols-3">
          {accreditations.map((raw, i) => {
            const item = localizeAccreditation(raw, t.data)
            return (
            <li key={item.label} className="h-full">
              <AnimateOnScroll delay={i * 100} className="h-full">
                <div className="flex h-full flex-col rounded-xl border border-white/15 bg-white/5 p-6">
                  <span
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10"
                    aria-hidden="true"
                  >
                    <item.icon className="h-6 w-6 text-white" />
                  </span>
                  <p className="text-xs tracking-[0.14em] text-white/60 uppercase">
                    {item.label}
                  </p>
                  <h3 className="font-display mt-2 text-step-1">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70">
                    {item.body}
                  </p>
                </div>
              </AnimateOnScroll>
            </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
