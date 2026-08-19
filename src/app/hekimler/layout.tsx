import type { Metadata } from "next"
import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/site"

// `page.tsx` is a Client Component and cannot export `metadata`, so the route's
// SEO lives in this server layout instead.
export const metadata: Metadata = pageMetadata({
  title: "Həkimlər",
  description: "Memorial Hospital həkimləri — ixtisas, filial və təcrübəyə görə axtarın və onlayn qəbula yazılın.",
  path: "/hekimler",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
