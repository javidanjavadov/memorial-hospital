"use client"

import { useCallback, useEffect, useRef } from "react"
import { RefreshCw } from "lucide-react"
import { useT } from "@/i18n/client"

/**
 * Distorted-text challenge, matching the one on the hospital's results page.
 *
 * IMPORTANT: this is a speed bump, not a security control. The expected answer
 * is generated in the browser, so anything scripted can read it. It stops
 * casual automation only.
 *
 * The lookup it guards returns medical records, so the real protection has to
 * be server-side: rate limiting per IP and per patient id, and a challenge
 * issued and verified by the server (or a managed service such as Turnstile or
 * hCaptcha). See lib/results.ts.
 */

// No 0/O, 1/I/J/L — indistinguishable in a distorted render, and the resulting
// "wrong" answers are the visitor's most common failure.
const ALPHABET = "ABCDEFGHKMNPQRSTUVWXYZ23456789"
const LENGTH = 6

const randomCode = () => {
  const values = new Uint32Array(LENGTH)
  crypto.getRandomValues(values)
  return Array.from(values, (v) => ALPHABET[v % ALPHABET.length]).join("")
}

export interface CaptchaHandle {
  /** Case-insensitive: the render gives no reliable case information. */
  verify: (answer: string) => boolean
  refresh: () => void
}

export default function Captcha({
  onReady,
  className,
}: {
  onReady?: (handle: CaptchaHandle) => void
  className?: string
}) {
  const t = useT()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const codeRef = useRef("")

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Wavy strokes across the glyphs, so the shapes cannot be read as isolated
    // letterforms by naive segmentation.
    ctx.strokeStyle = "rgba(20,96,107,0.35)"
    ctx.lineWidth = 1
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, Math.random() * height)
      ctx.bezierCurveTo(
        width * 0.3, Math.random() * height,
        width * 0.6, Math.random() * height,
        width, Math.random() * height
      )
      ctx.stroke()
    }

    const code = codeRef.current
    const step = width / (code.length + 1)
    for (let i = 0; i < code.length; i++) {
      const x = step * (i + 0.75)
      const y = height / 2 + (Math.random() * 8 - 4)
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((Math.random() * 0.5 - 0.25))
      ctx.font = `${26 + Math.random() * 6}px "Courier New", monospace`
      ctx.fillStyle = `hsl(${185 + Math.random() * 25}, 45%, ${22 + Math.random() * 18}%)`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(code[i], 0, 0)
      ctx.restore()
    }

    ctx.fillStyle = "rgba(20,96,107,0.35)"
    for (let i = 0; i < 60; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5)
    }
  }, [])

  /* No React state: the challenge lives in a ref and is painted straight onto
   * the canvas, so re-rendering the component would only repaint the same
   * pixels. */
  const refresh = useCallback(() => {
    codeRef.current = randomCode()
    draw()
  }, [draw])

  useEffect(() => {
    refresh()
    onReady?.({
      verify: (answer) =>
        answer.trim().toUpperCase() === codeRef.current.toUpperCase(),
      refresh,
    })
    // onReady is called once with a stable handle; refreshing does not re-issue it.
  }, [refresh, onReady])

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          width={190}
          height={56}
          // The code is decorative-but-essential: it exists only as pixels, so
          // it is unreadable to a screen reader. The audio-free fallback is the
          // call centre, surfaced next to the field.
          role="img"
          aria-label={t.ui.captchaImageAlt}
          className="rounded-lg border border-[var(--line)] bg-white"
        />
        <button
          type="button"
          onClick={refresh}
          aria-label={t.ui.newCaptcha}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink-muted)] transition-colors hover:border-primary/40 hover:text-primary"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
