import type { Metadata } from "next"
import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/site"

// `page.tsx` is a Client Component and cannot export `metadata`, so the route's
// SEO lives in this server layout instead.
export const metadata: Metadata = pageMetadata({
  title: "Daxil Ol",
  description: "Memorial Hospital hesabınıza daxil olun və qəbullarınızı idarə edin.",
  path: "/giris",
  noIndex: true,
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
