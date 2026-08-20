import type { Metadata } from "next"
import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/site"
import { getDictionary } from "@/i18n"

// `page.tsx` is a Client Component and cannot export `metadata`, so the route's
// SEO lives in this server layout instead.
/* generateMetadata, not a constant: the title and description are what a
 * search engine and a shared link show, and they follow the visitor's
 * language like the page does. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary()
  return pageMetadata({
    title: t.meta.contact.title,
    description: t.meta.contact.description,
    path: "/elaqe",
  })
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
