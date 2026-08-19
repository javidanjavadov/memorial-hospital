import type { Metadata } from "next"
import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Səbətim",
  description: "Seçdiyiniz laborator analizlər və sifariş.",
  path: "/sebet",
  noIndex: true,
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
