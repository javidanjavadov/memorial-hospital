import { branches, contactInfo, departments, FOUNDED_YEAR } from "@/data"
import { siteName, siteUrl } from "@/lib/site"

/**
 * schema.org markup so search engines can surface the hospital as a medical
 * organisation with real branches, rather than as a generic website.
 */
export default function StructuredData() {
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
    medicalSpecialty: departments.map((d) => d.name),
    address: {
      "@type": "PostalAddress",
      streetAddress: contactInfo.address,
      addressLocality: "Bakı",
      addressCountry: "AZ",
    },
    department: branches.map((branch) => ({
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
