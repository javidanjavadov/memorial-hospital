import type { Metadata } from "next"

/**
 * Canonical origin.
 *
 * Only `NEXT_PUBLIC_*` is read here: those are inlined at build time, so this
 * stays a static constant. Reading a non-public variable (e.g. Netlify's `URL`)
 * would be a *runtime* lookup, which marks every segment that imports this file
 * as dynamic.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://yuzuch.dev"
).replace(/\/$/, "")

export const siteName = "Memorial Hospital"

/**
 * Builds page metadata with a canonical URL and Open Graph defaults filled in.
 * Client Components cannot export `metadata`, so those routes get a small
 * server `layout.tsx` that calls this.
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string
  description: string
  path: string
  noIndex?: boolean
}): Metadata {
  const url = `${siteUrl}${path}`

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url,
      siteName,
      locale: "az_AZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
    },
  }
}
