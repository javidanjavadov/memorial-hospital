"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Animates every client-side route change.
 *
 * The wrapper is keyed by pathname, so React unmounts the old subtree and mounts
 * a fresh one on navigation, which replays the `page-enter` CSS animation. That
 * keeps the whole thing declarative: no state, no effects, no timers, and no
 * artificial delay before the new page is interactive.
 *
 * `prefers-reduced-motion` disables the animation in globals.css.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  )
}
