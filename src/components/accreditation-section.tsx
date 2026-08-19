import { Award, BadgeCheck, Globe2 } from "lucide-react"
import { AnimateOnScroll } from "@/components/animations"

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
const credentials = [
  {
    icon: BadgeCheck,
    label: "IAS Akkreditasiyası",
    title: "Beynəlxalq akkreditasiya",
    body: "Laboratoriyamız International Accreditation Service (IAS) tərəfindən akkreditə olunub — müayinə nəticələrinin beynəlxalq standartlara uyğunluğunun təsdiqi.",
  },
  {
    icon: Globe2,
    label: "RIQAS Participant",
    title: "Xarici keyfiyyətə nəzarət",
    body: "Randox International Quality Assessment Scheme (RIQAS) — dünyanın ən böyük xarici keyfiyyət qiymətləndirmə proqramında müntəzəm iştirak edirik.",
  },
  {
    icon: Award,
    label: "QCMD Participant",
    title: "Molekulyar diaqnostika",
    body: "Quality Control for Molecular Diagnostics (QCMD) proqramı molekulyar və PCR testlərimizin dəqiqliyini müstəqil şəkildə yoxlayır.",
  },
]

export default function AccreditationSection() {
  return (
    <section className="bg-[var(--ink)] py-16 text-white md:py-24">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm tracking-[0.14em] text-white/60 uppercase">
              Keyfiyyətə nəzarət
            </p>
            <h2 className="font-display text-step-3">
              Beynəlxalq standartlarla təsdiqlənmiş laboratoriya
            </h2>
            <p className="mt-4 text-step-1 text-white/70">
              Nəticələrimizin dəqiqliyi müstəqil beynəlxalq proqramlar
              tərəfindən müntəzəm yoxlanılır.
            </p>
          </div>
        </AnimateOnScroll>

        <ul className="grid gap-4 md:grid-cols-3">
          {credentials.map((item, i) => (
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
          ))}
        </ul>
      </div>
    </section>
  )
}
