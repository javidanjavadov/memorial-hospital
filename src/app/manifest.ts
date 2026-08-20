import type { MetadataRoute } from "next"
import { siteName } from "@/lib/site"
import { getDictionary } from "@/i18n"

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getDictionary()

  return {
    name: t.ui.siteTitle,
    short_name: siteName,
    description:
      t.ui.manifestDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#267B8D",
    lang: "az",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
