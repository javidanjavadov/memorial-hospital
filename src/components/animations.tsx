"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Set the first time any IntersectionObserver callback runs. Once we know the
 * observer works, no instance needs its scroll fallback — otherwise every
 * below-the-fold element would attach a redundant listener while waiting its
 * turn.
 */
let observerHasFired = false

/** True when the visitor has asked their OS to minimise motion. */
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

type Animation = "up" | "down" | "left" | "right" | "scale"

/**
 * Each direction needs its own start state. `down` previously shared the `up`
 * class, so `animation="down"` silently did the same thing as the default.
 */
const startClass: Record<Animation, string> = {
  up: "scroll-hidden",
  down: "scroll-hidden-down",
  left: "scroll-hidden-left",
  right: "scroll-hidden-right",
  scale: "scroll-hidden-scale",
}

interface AnimateOnScrollProps {
  children: ReactNode
  className?: string
  animation?: Animation
  delay?: number
  /** Pixels before the element reaches the viewport bottom. Mirrors AOS `offset`. */
  offset?: number
}

export function AnimateOnScroll({
  children,
  className,
  animation = "up",
  delay = 0,
  offset = 120,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    /*
     * Reduced motion is handled in CSS, not here.
     *
     * This used to bail out and reveal everything at once, which removed the
     * scroll choreography completely: by the time the visitor scrolled, every
     * section was already shown. The preference is about *movement*, not about
     * whether content appears as you reach it — so the observer still drives
     * the reveal and globals.css drops the translate, leaving a plain fade.
     *
     * Only a browser without IntersectionObserver reveals immediately. A timer
     * rather than requestAnimationFrame, which is paused while hidden.
     */
    if (!("IntersectionObserver" in window)) {
      const immediate = setTimeout(() => setIsVisible(true), 0)
      return () => clearTimeout(immediate)
    }

    let timer: ReturnType<typeof setTimeout>
    let triggered = false

    const observer = new IntersectionObserver(
      ([entry]) => {
        observerHasFired = true
        if (entry.isIntersecting) {
          triggered = true
          timer = setTimeout(() => setIsVisible(true), delay)
          // Unobserve = AOS's `once: true`; it never replays on scroll back.
          observer.unobserve(entry.target)
        }
      },
      /*
       * A negative bottom margin fires the animation once the element is
       * `offset` px inside the viewport, which is how AOS behaves. A percentage
       * threshold instead meant a tall section had to be 15% on screen — so
       * full-height blocks animated late, or not until well past their top.
       */
      { rootMargin: `0px 0px -${offset}px 0px`, threshold: 0 }
    )

    observer.observe(node)

    /*
     * Safety net for the observer never firing — every block starts at opacity
     * 0, so that failure renders a blank page.
     *
     * It must NOT simply reveal everything on a timer: that fires for elements
     * far below the fold too, so by the time the visitor scrolls to them they
     * are already shown and nothing animates. It only takes over if the
     * observer has stayed silent, and then reveals each element as it actually
     * reaches the viewport.
     */
    let onScroll: (() => void) | null = null

    const failsafe = setTimeout(() => {
      // Observer is alive and simply has not reached this element yet.
      if (triggered || observerHasFired) return

      onScroll = () => {
        const rect = node.getBoundingClientRect()
        if (rect.top < window.innerHeight - offset && rect.bottom > 0) {
          setIsVisible(true)
          if (onScroll) window.removeEventListener("scroll", onScroll)
          onScroll = null
        }
      }
      onScroll()
      if (onScroll) window.addEventListener("scroll", onScroll, { passive: true })
    }, 3000)

    return () => {
      clearTimeout(timer)
      clearTimeout(failsafe)
      if (onScroll) window.removeEventListener("scroll", onScroll)
      observer.disconnect()
    }
  }, [delay, offset])

  return (
    <div
      ref={ref}
      className={cn(startClass[animation], isVisible && "scroll-visible", className)}
    >
      {children}
    </div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Reduced motion is a CSS concern; the reveal stays scroll-driven.
    if (!("IntersectionObserver" in window)) {
      const immediate = setTimeout(() => setIsVisible(true), 0)
      return () => clearTimeout(immediate)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "stagger-children",
        isVisible && "[&>*]:opacity-100 [&>*]:translate-y-0",
        className
      )}
    >
      {children}
    </div>
  )
}

interface CountUpProps {
  end: number
  suffix?: string
  className?: string
  duration?: number
}

export function CountUp({
  end,
  suffix = "",
  className,
  duration = 2000,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      // Timer, not rAF — rAF is paused while the document is hidden.
      const immediate = setTimeout(() => setStarted(true), 0)
      return () => clearTimeout(immediate)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return

    /*
     * Driven by rAF rather than a 16ms interval: setInterval drifts under load
     * and keeps firing in background tabs, which made the counter overshoot.
     * Reduced motion collapses the duration to zero, so the final figure is
     * painted on the first frame instead of ticking up to it.
     */
    const effectiveDuration = prefersReducedMotion() ? 0 : duration
    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress =
        effectiveDuration === 0
          ? 1
          : Math.min((now - start) / effectiveDuration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(end * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [started, end, duration])

  return (
    <span ref={ref} className={cn("animate-count", className)}>
      {count}
      {suffix}
    </span>
  )
}
