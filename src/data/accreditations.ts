import { Award, BadgeCheck, Globe2, type LucideIcon } from "lucide-react"

export interface Accreditation {
  icon: LucideIcon
  /** Wordmark, kept as the accessible name for the logo. */
  mark: string
  markNote: string
  /** Official logo. Dark artwork, so it needs a light chip behind it. */
  logo: string
  /** Intrinsic size at the exported height of 120px, for next/image. */
  logoWidth: number
  logoHeight: number
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
    logo: "/accreditations/ias.png",
    logoWidth: 248,
    logoHeight: 120,
    markNote: "Akkreditasiya",
    label: "IAS Akkreditasiyası",
    title: "Beynəlxalq akkreditasiya",
    body: "Laboratoriyamız International Accreditation Service (IAS) tərəfindən akkreditə olunub — müayinə nəticələrinin beynəlxalq standartlara uyğunluğunun təsdiqi.",
  },
  {
    icon: Globe2,
    mark: "RIQAS",
    logo: "/accreditations/riqas.png",
    logoWidth: 509,
    logoHeight: 120,
    markNote: "Participant",
    label: "RIQAS Participant",
    title: "Xarici keyfiyyətə nəzarət",
    body: "Randox International Quality Assessment Scheme (RIQAS) — dünyanın ən böyük xarici keyfiyyət qiymətləndirmə proqramında müntəzəm iştirak edirik.",
  },
  {
    icon: Award,
    mark: "QCMD",
    logo: "/accreditations/qcmd.png",
    logoWidth: 451,
    logoHeight: 120,
    markNote: "Participant",
    label: "QCMD Participant",
    title: "Molekulyar diaqnostika",
    body: "Quality Control for Molecular Diagnostics (QCMD) proqramı molekulyar və PCR testlərimizin dəqiqliyini müstəqil şəkildə yoxlayır.",
  },
]
