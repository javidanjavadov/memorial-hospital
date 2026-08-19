"use client"

import { useId, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Props a `Field` hands to its control so label, error and input stay wired. */
export interface FieldControlProps {
  id: string
  "aria-invalid": boolean | undefined
  "aria-describedby": string | undefined
  "aria-required": boolean | undefined
}

interface FieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: (props: FieldControlProps) => ReactNode
}

/**
 * Wires a `<label htmlFor>` to its control and announces validation errors.
 *
 * Every form control on the site goes through this, because hand-written
 * `<label>` + `<input>` pairs kept shipping without the `htmlFor`/`id` link —
 * which leaves the field unnamed for screen readers and makes the label
 * unclickable.
 */
export function Field({
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <>
            {" "}
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
            <span className="sr-only">(mütləq)</span>
          </>
        )}
      </label>

      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })}

      {hint && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

/** Shared styling for the native `<select>` / `<textarea>` used across forms. */
export const controlClass =
  "w-full h-11 px-4 rounded-lg border bg-background text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-red-500 border-input"

export const textareaClass =
  "w-full px-4 py-3 rounded-lg border border-input bg-background text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none aria-[invalid=true]:border-red-500"
