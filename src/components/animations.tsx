"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

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
     * Reveal without waiting on the observer.
     *
     * Scheduled rather than set inline so the effect body stays free of
     * synchronous state updates. A timer, not requestAnimationFrame: rAF is
     * paused while the document is hidden, so a tab opened in the background
     * would stay at opacity 0 until it was focused.
     */
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      const immediate = setTimeout(() => setIsVisible(true), 0)
      return () => clearTimeout(immediate)
    }

    let timer: ReturnType<typeof setTimeout>
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
     * Safety net. Every animated block starts at opacity 0, so if the observer
     * never fires the page renders blank — and on a hospital site that failure
     * is far worse than showing the content unanimated. Reveal regardless after
     * a few seconds; in the normal case the observer has long since won and
     * this is a no-op.
     */
    const failsafe = setTimeout(() => setIsVisible(true), 3000)

    return () => {
      clearTimeout(timer)
      clearTimeout(failsafe)
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

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      // Timer, not rAF — rAF is paused while the document is hidden.
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
