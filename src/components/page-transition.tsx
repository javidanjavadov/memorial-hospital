"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPath.current) {
      window.scrollTo({ top: 0, behavior: "instant" })
      prevPath.current = pathname
    }
  }, [pathname])

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      {children}
    </div>
  )
}
