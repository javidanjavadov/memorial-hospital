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
  threshold?: number
}

export function AnimateOnScroll({
  children,
  className,
  animation = "up",
  delay = 0,
  threshold = 0.15,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Reveal immediately rather than animating, and skip the observer entirely.
    // Scheduled rather than set inline so the effect body stays free of
    // synchronous state updates (cascading renders).
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(frame)
    }

    let timer: ReturnType<typeof setTimeout>
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    observer.observe(node)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [delay, threshold])

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
      const frame = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(frame)
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
      const frame = requestAnimationFrame(() => setStarted(true))
      return () => cancelAnimationFrame(frame)
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
