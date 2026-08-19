/**
 * Animated scrolling, driven by requestAnimationFrame.
 *
 * `window.scrollTo({ behavior: "smooth" })` is not usable here: the CSS
 * `scroll-behavior` cascade (and the OS "reduce motion" setting that forces it
 * to `auto`) silently turns it into an instant jump, which is what made the
 * in-page nav feel like nothing happened. Positioning the window frame by frame
 * keeps the motion under our control.
 */

/** Symmetric acceleration/deceleration — starts and lands gently. */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const MIN_MS = 700
const MAX_MS = 1500
/** Milliseconds of travel per pixel, before clamping. */
const MS_PER_PX = 0.35

let activeFrame: number | null = null

/** Distance-aware duration, so short hops are not sluggish and long ones are
 *  not frantic. */
export const scrollDuration = (distance: number) =>
  Math.min(MAX_MS, Math.max(MIN_MS, Math.abs(distance) * MS_PER_PX))

export function smoothScrollTo(targetY: number, duration?: number) {
  if (typeof window === "undefined") return

  // A second click mid-flight replaces the first rather than fighting it.
  if (activeFrame !== null) cancelAnimationFrame(activeFrame)

  const startY = window.scrollY
  const maxY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  )
  const endY = Math.min(Math.max(targetY, 0), maxY)
  const distance = endY - startY

  if (Math.abs(distance) < 2) return

  const total = duration ?? scrollDuration(distance)

  /*
   * requestAnimationFrame does not fire while the document is hidden, so an
   * animated scroll started in a background tab would never run at all and the
   * page would simply stay put. Jump straight to the destination instead.
   */
  if (document.visibilityState === "hidden") {
    window.scrollTo(0, endY)
    return
  }

  const start = performance.now()

  /** Let the visitor take back control the moment they scroll themselves. */
  const abort = () => {
    if (activeFrame !== null) cancelAnimationFrame(activeFrame)
    activeFrame = null
    detach()
  }
  const detach = () => {
    window.removeEventListener("wheel", abort)
    window.removeEventListener("touchstart", abort)
    window.removeEventListener("keydown", abort)
  }
  window.addEventListener("wheel", abort, { passive: true, once: true })
  window.addEventListener("touchstart", abort, { passive: true, once: true })
  window.addEventListener("keydown", abort, { once: true })

  let finished = false

  const step = (now: number) => {
    const progress = Math.min((now - start) / total, 1)
    window.scrollTo(0, startY + distance * easeInOutCubic(progress))

    if (progress < 1) {
      activeFrame = requestAnimationFrame(step)
    } else {
      finished = true
      activeFrame = null
      detach()
    }
  }

  activeFrame = requestAnimationFrame(step)

  /*
   * Watchdog: if the tab is hidden part-way through, the frame loop stalls and
   * the visitor would return to a half-scrolled page. Timers keep running (just
   * throttled), so this settles the scroll either way.
   */
  window.setTimeout(() => {
    if (finished || activeFrame === null) return
    cancelAnimationFrame(activeFrame)
    activeFrame = null
    detach()
    window.scrollTo(0, endY)
  }, total + 600)
}

/** Scrolls an element into view, allowing for the sticky header. */
export function smoothScrollToElement(el: HTMLElement, offset = 100) {
  smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - offset)
}
