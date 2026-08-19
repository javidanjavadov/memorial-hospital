"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

/**
 * Top-of-viewport progress bar shown while a client-side navigation is pending.
 *
 * Rather than monkey-patching `window.history` (which fights Next's own router),
 * this listens for clicks on internal links during the capture phase and derives
 * visibility: the bar is shown while the pathname is still the one we navigated
 * *away from*. When the new route commits, `pathname` changes and the bar
 * disappears on its own — no state update needed, so there is no render loop.
 */
export default function RouteLoader() {
  const pathname = usePathname()
  const [leavingFrom, setLeavingFrom] = useState<string | null>(null)

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Let the browser handle modified clicks (new tab, download, etc.).
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (
        !href ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return
      }

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      // Same page (or just a hash change) — nothing is loading.
      if (url.pathname === window.location.pathname) return

      setLeavingFrom(window.location.pathname)
    }

    const onPopState = () => setLeavingFrom(window.location.pathname)

    document.addEventListener("click", onClick, true)
    window.addEventListener("popstate", onPopState)
    return () => {
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("popstate", onPopState)
    }
  }, [])

  // Derived, not stored: once the new route commits the pathname differs and the
  // bar hides itself.
  const isNavigating = leavingFrom !== null && leavingFrom === pathname

  if (!isNavigating) return null

  return (
    <div
      className="route-loader pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
      role="progressbar"
      aria-label="Səhifə yüklənir"
      aria-busy="true"
    >
      <div className="route-loader__bar h-full w-full bg-gradient-to-r from-teal-700 via-teal-500 to-teal-300 shadow-[0_0_10px_rgba(93,170,160,0.7)]" />
    </div>
  )
}
