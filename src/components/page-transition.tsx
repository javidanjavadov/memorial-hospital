"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Plays an opening animation on every client-side route change.
 *
 * The wrapper is keyed by pathname, so React unmounts the old subtree and
 * mounts a fresh one on navigation — which replays the `pageEnter` CSS
 * animation defined in globals.css.
 *
 * Deliberately *not* a fade-out-then-swap: holding the outgoing page in state
 * and swapping it on a timer leaves the viewport blank for the whole exit
 * duration, which reads as a stall rather than as motion, and delays the new
 * page becoming interactive. Animating the incoming page instead means the new
 * content is on screen straight away and visibly moves into place.
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
