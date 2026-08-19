import type { Metadata } from "next"

/**
 * Canonical origin. Netlify/Vercel expose the deploy URL at build time; the
 * literal is the production fallback so `metadataBase` is never undefined
 * (which would leave every Open Graph URL unresolved).
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.URL || "https://yuzuch.dev")
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
