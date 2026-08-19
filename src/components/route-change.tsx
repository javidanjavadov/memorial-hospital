"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function RouteChange({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState("visible")
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPath.current) {
      setTransitionStage("fading-out")
    }
  }, [pathname])

  useEffect(() => {
    if (transitionStage === "fading-out") {
      const timer = setTimeout(() => {
        setDisplayChildren(children)
        setTransitionStage("fading-in")
        window.scrollTo({ top: 0, behavior: "instant" })
      }, 150)
      return () => clearTimeout(timer)
    }
    if (transitionStage === "fading-in") {
      const timer = setTimeout(() => {
        setTransitionStage("visible")
        prevPath.current = pathname
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [transitionStage, children, pathname])

  return (
    <div
      className="transition-opacity duration-150 ease-out"
      style={{
        opacity: transitionStage === "fading-out" ? 0 : 1,
      }}
    >
      {displayChildren}
    </div>
  )
}
