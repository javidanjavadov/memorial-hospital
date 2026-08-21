"use client"

import Link from "next/link"
import { Check, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { controlClass } from "@/components/ui/field"
import { isSelf, type Patient } from "@/lib/patients"
import { useT } from "@/i18n/client"
import { cn } from "@/lib/utils"
import type azDict from "@/i18n/dictionaries/az.json"

/** Dictionary keys, resolved at render: a module constant cannot know the locale. */
const RELATION_LABELS: Record<string, keyof (typeof azDict)["family"]> = {
  self: "self",
  spouse: "relationSpouse",
  child: "relationChild",
  parent: "relationParent",
  sibling: "relationSibling",
  other: "relationOther",
}

/** dd.MM.yyyy — see the note in src/app/profil/page.tsx on az-AZ formatting. */
const formatDate = (iso: string) => {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

const initialsOf = (fullName: string) =>
  fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")

/** The relationship word for a patient, in the current language. */
export function relationLabel(
  patient: Patient,
  t: ReturnType<typeof useT>
): string {
  return t.family[RELATION_LABELS[patient.relation] ?? "relationOther"]
}

export function patientLabel(
  patient: Patient,
  t: ReturnType<typeof useT>
): string {
  const relation = t.family[RELATION_LABELS[patient.relation] ?? "relationOther"]
  return isSelf(patient)
    ? `${relation} — ${patient.fullName}`
    : `${patient.fullName} (${relation})`
}

/**
 * Who an appointment or an order is being placed for.
 *
 * Two shapes of the same choice. "cards" is the booking form's first step,
 * where the choice is the whole screen and the details matter — two relatives
 * with the same surname are told apart by date of birth and FIN, not by name.
 * "select" is the compact one for the service picker's header, where the
 * patient has already been chosen and is only being confirmed or swapped.
 *
 * Nothing is preselected when the account has relatives. Defaulting to the
 * account holder is exactly how a child's appointment gets filed under a
 * parent, and neither the form nor the laboratory would notice.
 */
export default function PatientSelect({
  patients,
  value,
  onChange,
  variant = "cards",
  id,
  invalid,
  describedBy,
  className,
}: {
  patients: Patient[]
  value: string
  onChange: (id: string) => void
  variant?: "cards" | "select"
  id?: string
  invalid?: boolean
  describedBy?: string
  className?: string
}) {
  const t = useT()

  if (variant === "select") {
    return (
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(controlClass, className)}
      >
        {/* An empty option so an unmade choice is visible as one, rather than
            reading as the first person in the list. */}
        {!value && <option value="">{t.family.selectPatient}</option>}
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patientLabel(patient, t)}
          </option>
        ))}
      </select>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label={t.family.forWhom}
      aria-describedby={describedBy}
      className={cn("space-y-3", className)}
    >
      {patients.map((patient) => {
        const selected = patient.id === value
        return (
          <button
            key={patient.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(patient.id)}
            className={cn(
              "flex w-full flex-wrap items-center gap-4 rounded-xl border p-4 text-left transition-colors",
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-[var(--line)] hover:border-primary"
            )}
          >
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                selected ? "bg-primary" : "bg-[var(--ink)]"
              )}
              aria-hidden="true"
            >
              {selected ? (
                <Check className="h-5 w-5" />
              ) : (
                initialsOf(patient.fullName)
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium uppercase text-[var(--ink)]">
                  {patient.fullName}
                </span>
                <Badge variant={isSelf(patient) ? "default" : "secondary"}>
                  {t.family[RELATION_LABELS[patient.relation] ?? "relationOther"]}
                </Badge>
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ink-muted)]">
                {patient.birthDate && (
                  <span>
                    {t.profile.birthDate}: {formatDate(patient.birthDate)}
                  </span>
                )}
                <span>
                  {patient.gender === "FEMALE"
                    ? t.profile.female
                    : t.profile.male}
                </span>
                {patient.finCode && (
                  <span>
                    {t.profile.finCode}:{" "}
                    <span className="font-mono">{patient.finCode}</span>
                  </span>
                )}
              </span>
            </span>
          </button>
        )
      })}

      {/* Adding a relative is account admin, so it happens on the profile —
          filling in someone's FIN mid-booking is not the moment for it. */}
      <Link
        href="/profil?tab=family"
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[var(--line)] p-4 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:border-primary hover:text-primary"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--line)]"
          aria-hidden="true"
        >
          <UserPlus className="h-5 w-5" />
        </span>
        {t.family.addFromPicker}
      </Link>
    </div>
  )
}
