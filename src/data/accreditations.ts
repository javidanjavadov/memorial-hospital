import { Award, BadgeCheck, Globe2, type LucideIcon } from "lucide-react"

export interface Accreditation {
  icon: LucideIcon
  /** Wordmark, set large. */
  mark: string
  markNote: string
  label: string
  title: string
  body: string
}

/**
 * Laboratory accreditation and external quality assessment.
 *
 * Shared by the bar under the hero and the detailed section further down, so
 * the two can never claim different things. RIQAS and QCMD participation is
 * printed on the hospital's own reports under "XARICI KEYFİYYƏTƏ NƏZARƏT"; the
 * IAS accreditation is the laboratory's own.
 *
 * Every claim here is verifiable — nothing padded out with invented awards.
 */
export const accreditations: Accreditation[] = [
  {
    icon: BadgeCheck,
    mark: "IAS",
    markNote: "Akkreditasiya",
    label: "IAS Akkreditasiyası",
    title: "Beynəlxalq akkreditasiya",
    body: "Laboratoriyamız International Accreditation Service (IAS) tərəfindən akkreditə olunub — müayinə nəticələrinin beynəlxalq standartlara uyğunluğunun təsdiqi.",
  },
  {
    icon: Globe2,
    mark: "RIQAS",
    markNote: "Participant",
    label: "RIQAS Participant",
    title: "Xarici keyfiyyətə nəzarət",
    body: "Randox International Quality Assessment Scheme (RIQAS) — dünyanın ən böyük xarici keyfiyyət qiymətləndirmə proqramında müntəzəm iştirak edirik.",
  },
  {
    icon: Award,
    mark: "QCMD",
    markNote: "Participant",
    label: "QCMD Participant",
    title: "Molekulyar diaqnostika",
    body: "Quality Control for Molecular Diagnostics (QCMD) proqramı molekulyar və PCR testlərimizin dəqiqliyini müstəqil şəkildə yoxlayır.",
  },
]
