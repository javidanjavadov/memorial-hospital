import type { MetadataRoute } from "next"
import { siteName } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} | Bakıdakı Müasir Klinik Xidmətlər Mərkəzi`,
    short_name: siteName,
    description:
      "Memorial Hospital — onlayn qəbul, həkimlər və filiallar haqqında məlumat.",
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
