"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle")
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPath.current) {
      setPhase("exit")
    }
  }, [pathname])

  useEffect(() => {
    if (phase === "exit") {
      const t = setTimeout(() => {
        setDisplayChildren(children)
        setPhase("enter")
        window.scrollTo({ top: 0, behavior: "instant" })
      }, 200)
      return () => clearTimeout(t)
    }
    if (phase === "enter") {
      const t = setTimeout(() => {
        setPhase("idle")
        prevPath.current = pathname
      }, 300)
      return () => clearTimeout(t)
    }
  }, [phase, children, pathname])

  return (
    <div
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transform: phase === "exit" ? "translateY(16px)" : "translateY(0)",
        transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
      }}
    >
      {displayChildren}
    </div>
  )
}
