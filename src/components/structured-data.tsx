import { branches, contactInfo, departments, FOUNDED_YEAR } from "@/data"
import { siteName, siteUrl } from "@/lib/site"
import { getDictionary } from "@/i18n"
import { localizeBranch, localizeDepartment } from "@/i18n/data"

/**
 * schema.org markup so search engines can surface the hospital as a medical
 * organisation with real branches, rather than as a generic website.
 */
export default async function StructuredData() {
  /* The same content the page shows. A Russian page describing itself to a
     search engine in Azerbaijani is the same mistake as showing it. */
  const t = await getDictionary()

  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    foundingDate: String(FOUNDED_YEAR),
    telephone: contactInfo.phone,
    email: contactInfo.email,
    medicalSpecialty: departments.map(
      (d) => localizeDepartment(d, t.data).name
    ),
    address: {
      "@type": "PostalAddress",
      streetAddress: t.data.contact.address ?? contactInfo.address,
      addressLocality: t.ui.keywordBaku,
      addressCountry: "AZ",
    },
    department: branches
      .map((raw) => localizeBranch(raw, t.data))
      .map((branch) => ({
        "@type": "MedicalClinic",
        name: branch.name,
        telephone: branch.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: branch.address,
          addressCountry: "AZ",
        },
        openingHours: branch.workingHours,
      })),
  }

  return (
    <script
      type="application/ld+json"
      // Serialised from trusted local data only; `<` is escaped so the payload
      // can never close the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
