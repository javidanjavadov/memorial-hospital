"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Users, X } from "lucide-react"
import PatientSelect from "@/components/patient-select"
import type { Patient } from "@/lib/patients"
import { useT } from "@/i18n/client"

/** Matches the exit animations in globals.css (.dialog-card[data-state]). */
const EXIT_MS = 300
/** The reduced-motion exit drops the travel but keeps the timing. */
const REDUCED_EXIT_MS = 280

/**
 * Asks who the order is for, once, on the way into the catalogue.
 *
 * It is a dialog rather than a step in the page because the answer is a setting
 * on the order, not a stage of building one — the catalogue stays where it is
 * behind it, and dismissing leaves you in the list rather than at the start of
 * a wizard.
 *
 * Shown only when the answer is not already known: an account with relatives
 * and nobody chosen yet. Once a choice is made it is remembered, so this does
 * not greet the same person on every visit — the selector in the header is
 * where it changes after that, which is what the dialog points at on its way
 * out.
 *
 * Mounted only while it is on screen — the parent renders it conditionally —
 * so each appearance starts fresh and the entry animation replays. Closing is
 * therefore a two-step affair: the card plays its exit, and only when that
 * finishes does it tell the parent, which unmounts it. Calling back
 * immediately would unmount mid-animation and the dialog would vanish.
 *
 * Rendered through a portal into <body>, and that is load-bearing rather than
 * tidiness. `position: fixed` is resolved against the nearest ancestor that has
 * a transform, a filter or `will-change` — and the page wrapper has both an
 * animated transform and `will-change: transform`. Left in place, `inset-0`
 * therefore covered the PAGE rather than the viewport, and the dialog centred
 * itself in the middle of a very long catalogue: far below the fold, on a
 * screen the visitor had not scrolled to.
 */
export default function PatientPrompt({
  patients,
  selected,
  onChoose,
  onDismiss,
}: {
  patients: Patient[]
  /** Whoever was chosen last, shown ticked so a returning visitor confirms
   *  rather than hunting for the same name again. */
  selected: string
  onChoose: (id: string) => void
  onDismiss: () => void
}) {
  const t = useT()
  const closeRef = useRef<HTMLButtonElement>(null)
  /* Set in an event handler, never in an effect: the exit is something the
     visitor started, not a reaction to a prop changing. */
  const [closing, setClosing] = useState(false)
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current)
    },
    []
  )

  /**
   * Plays the exit, then hands back to the parent, which unmounts this.
   *
   * On a timer rather than on `animationend`. The event looks like the tidier
   * signal, but an animation collapsed to a fraction of a millisecond — which
   * is what the blanket reduced-motion rule used to do here — never delivered
   * one, and the dialog stuck open with the page frozen behind it. A timer
   * fires whether or not the animation is observable, which is the property
   * that matters when the thing it controls is the only way out.
   */
  const startClose = (done: () => void) => {
    if (closing) return
    setClosing(true)

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    exitTimer.current = setTimeout(done, reduced ? REDUCED_EXIT_MS : EXIT_MS)
  }

  /* Escape closes, and the body does not scroll behind the dialog. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") startClose(onDismiss)
    }
    document.addEventListener("keydown", onKey)

    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
    // `closing` is deliberately absent: re-running this would steal focus back
    // to the close button midway through the exit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDismiss])

  /*
   * Only ever mounted on the client: the parent renders this behind a condition
   * that depends on the session and on localStorage, neither of which the
   * server has. So there is always a document to portal into.
   */
  return createPortal(
    <div
      className="dialog-overlay fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      data-state={closing ? "closing" : "open"}
      role="presentation"
      onClick={(event) => {
        // Only the backdrop itself, not a click that bubbled out of the card.
        if (event.target === event.currentTarget) startClose(onDismiss)
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-prompt-title"
        aria-describedby="patient-prompt-hint"
        className="dialog-card max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[var(--paper-raised)] p-6 shadow-xl sm:rounded-2xl"
        data-state={closing ? "closing" : "open"}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10"
              aria-hidden="true"
            >
              <Users className="h-5 w-5 text-primary" />
            </span>
            <h2
              id="patient-prompt-title"
              className="font-display text-step-1 text-[var(--ink)]"
            >
              {t.family.forWhom}
            </h2>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={() => startClose(onDismiss)}
            aria-label={t.common.close}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--ink-muted)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--ink)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p
          id="patient-prompt-hint"
          className="mt-3 text-sm text-[var(--ink-muted)]"
        >
          {t.family.promptHint}
        </p>

        <PatientSelect
          patients={patients}
          value={selected}
          onChange={(id) => startClose(() => onChoose(id))}
          className="mt-5"
        />
      </div>
    </div>,
    document.body
  )
}
