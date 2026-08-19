import type { Metadata } from "next"
import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/site"

// `page.tsx` is a Client Component and cannot export `metadata`, so the route's
// SEO lives in this server layout instead.
export const metadata: Metadata = pageMetadata({
  title: "Profilim",
  description: "Şəxsi məlumatlarınızı və qəbullarınızı idarə edin.",
  path: "/profil",
  noIndex: true,
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
