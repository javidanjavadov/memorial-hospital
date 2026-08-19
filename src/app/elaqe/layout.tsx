import type { Metadata } from "next"
import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/site"

// `page.tsx` is a Client Component and cannot export `metadata`, so the route's
// SEO lives in this server layout instead.
export const metadata: Metadata = pageMetadata({
  title: "Əlaqə",
  description: "Memorial Hospital ilə əlaqə saxlayın — telefon, email, ünvan və iş saatları.",
  path: "/elaqe",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
