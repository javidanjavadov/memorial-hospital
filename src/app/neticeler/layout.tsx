import type { Metadata } from "next"
import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Nəticələrimə bax",
  description:
    "Memorial Hospital laborator analiz nəticələrinizi pasiyent və sifariş nömrəsi ilə onlayn yoxlayın.",
  path: "/neticeler",
  // Medical records: nothing here should be indexed.
  noIndex: true,
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
