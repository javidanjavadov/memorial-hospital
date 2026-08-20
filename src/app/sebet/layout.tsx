import type { Metadata } from "next"
import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/site"
import { getDictionary } from "@/i18n"

/* generateMetadata, not a constant: the title and description are what a
 * search engine and a shared link show, and they follow the visitor's
 * language like the page does. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary()
  return pageMetadata({
    title: t.meta.basket.title,
    description: t.meta.basket.description,
    path: "/sebet",
  })
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
