"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/client"

export interface TourStep {
  /** id of the element this step points at. */
  target: string
  title: string
  body: string
}

/** Where the card ended up, so the tail can point back at the target. */
type Placement = "right" | "below"

interface Position {
  top: number
  left: number
  placement: Placement
  /** The target's box, for the ring drawn around it. */
  ring: { top: number; left: number; width: number; height: number }
}

const CARD_WIDTH = 300
const GAP = 16

/**
 * A short guided tour of the catalogue.
 *
 * Anchored to real elements rather than shown as a modal: the point is to say
 * "this control, here", and a dialog in the middle of the screen cannot do
 * that. Each step measures its target and places the card in the empty column
 * beside it, falling back to underneath when there is no room — which is what
 * happens on a narrow screen, where the catalogue runs the full width.
 *
 * Skippable at every step, because most people do not need it and being walked
 * through four screens you already understand is worse than no help at all.
 *
 * Portalled into <body> for the same reason the patient dialog is: `position:
 * fixed` resolves against the nearest transformed ancestor, and the page
 * wrapper animates a transform, so a fixed overlay left in place would be
 * measured against the whole page instead of the viewport.
 */
export default function PickerTour({
  steps,
  onFinish,
}: {
  steps: TourStep[]
  onFinish: () => void
}) {
  const t = useT()
  const [index, setIndex] = useState(0)
  const [position, setPosition] = useState<Position | null>(null)

  const step = steps[index]

  /**
   * Measures the current target and decides where the card goes.
   *
   * A step whose target is not on screen is skipped rather than shown against
   * nothing. That covers the basket column, which is hidden below xl and so is
   * present in the document with a zero-sized box — and it is why the caller
   * hands over every step rather than filtering the list itself: filtering
   * meant reading the DOM during render, which sees the previous commit, and
   * the step pointing at the patient card was dropped every time because that
   * card is created by the very choice that starts the tour.
   */
  const place = useCallback(() => {
    const element = step ? document.getElementById(step.target) : null
    const box = element?.getBoundingClientRect()

    if (!element || !box || box.width === 0 || box.height === 0) {
      setPosition(null)
      if (index < steps.length - 1) setIndex(index + 1)
      else onFinish()
      return
    }

    const roomOnRight = window.innerWidth - box.right

    // The empty column beside the control is the natural home for this. Only
    // when it is not there does the card drop underneath.
    const placement: Placement =
      roomOnRight >= CARD_WIDTH + GAP * 2 ? "right" : "below"

    const top =
      placement === "right"
        ? Math.max(GAP, box.top)
        : box.bottom + GAP

    const left =
      placement === "right"
        ? box.right + GAP
        : Math.min(box.left, window.innerWidth - CARD_WIDTH - GAP)

    setPosition({
      top,
      left: Math.max(GAP, left),
      placement,
      ring: {
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
      },
    })
  }, [step, index, steps.length, onFinish])

  useEffect(() => {
    // The target for a step may be below the fold — bring it into view first,
    // then measure, or the card is placed against a box nobody can see.
    const element = step ? document.getElementById(step.target) : null
    element?.scrollIntoView({ block: "center", behavior: "smooth" })

    /* Deferred by a tick rather than measured inline: the target may have just
       mounted, and the smooth scroll above has not moved it yet. */
    const initial = setTimeout(place, 0)

    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    return () => {
      clearTimeout(initial)
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
    }
  }, [place, step])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onFinish()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onFinish])

  if (!step) return null

  const isLast = index === steps.length - 1

  return createPortal(
    <>
      {/* A ring around the target rather than a dimming backdrop: the page
          stays readable, which is the thing being explained. */}
      {position && (
        <div
          className="pointer-events-none fixed z-40 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-[var(--paper)] transition-all duration-300"
          style={{
            top: position.ring.top,
            left: position.ring.left,
            width: position.ring.width,
            height: position.ring.height,
          }}
          aria-hidden="true"
        />
      )}

      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className="tour-card fixed z-50 rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-4 shadow-xl"
        style={{
          width: CARD_WIDTH,
          top: position?.top ?? GAP,
          left: position?.left ?? GAP,
        }}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <p className="text-xs font-medium text-primary">
            {t.f(t.tour.step, { current: index + 1, total: steps.length })}
          </p>
          <button
            type="button"
            onClick={onFinish}
            aria-label={t.tour.skip}
            className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-muted)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--ink)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <h3
          id="tour-title"
          className="font-display text-step-0 text-[var(--ink)]"
        >
          {step.title}
        </h3>
        <p
          id="tour-body"
          className="mt-1.5 text-sm leading-relaxed text-[var(--ink-muted)]"
        >
          {step.body}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onFinish}
            className="text-sm text-[var(--ink-muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
          >
            {t.tour.skip}
          </button>

          <Button
            variant="cta"
            size="sm"
            onClick={() => (isLast ? onFinish() : setIndex(index + 1))}
          >
            {isLast ? t.tour.done : t.tour.next}
            {!isLast && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </>,
    document.body
  )
}
