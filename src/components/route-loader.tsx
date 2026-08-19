"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function RouteLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [prevPath, setPrevPath] = useState(pathname)

  useEffect(() => {
    if (pathname !== prevPath) {
      setLoading(false)
      setPrevPath(pathname)
    }
  }, [pathname, prevPath])

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    const origPush = window.history.pushState
    const origReplace = window.history.replaceState

    window.history.pushState = function (...args) {
      handleStart()
      return origPush.apply(this, args)
    }
    window.history.replaceState = function (...args) {
      handleStart()
      return origReplace.apply(this, args)
    }

    window.addEventListener("popstate", handleStart)

    return () => {
      window.history.pushState = origPush
      window.history.replaceState = origReplace
      window.removeEventListener("popstate", handleStart)
    }
  }, [])

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 600)
      return () => clearTimeout(timer)
    }
  }, [loading])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1">
      <div className="h-full bg-gradient-to-r from-teal-500 to-teal-300 animate-shimmer rounded-full" 
        style={{
          backgroundSize: "200% 100%",
          animation: "shimmer 1s ease-in-out infinite",
        }}
      />
    </div>
  )
}
