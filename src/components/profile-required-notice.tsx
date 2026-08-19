"use client"

import Link from "next/link"
import { AlertCircle, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProfileField } from "@/lib/profile-complete"

/**
 * Shown in place of a submit control when the signed-in profile is missing
 * details the request cannot be honoured without.
 *
 * It names the missing fields rather than saying "complete your profile", so
 * the visitor knows what they are being sent to do before they get there.
 */
export default function ProfileRequiredNotice({
  missing,
  next,
  reason,
}: {
  missing: ProfileField[]
  /** Where to return after the profile is filled in. */
  next: string
  reason: string
}) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-amber-900">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        Profiliniz tamamlanmayıb
      </p>
      <p className="mt-1 text-xs text-amber-900/80">{reason}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {missing.map((field) => (
          <li
            key={field.key}
            className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
          >
            {field.label}
          </li>
        ))}
      </ul>
      <Button variant="cta" className="mt-3 w-full" asChild>
        <Link href={`/profil?next=${encodeURIComponent(next)}`}>
          <UserCog className="h-4 w-4" aria-hidden="true" />
          Profili tamamla
        </Link>
      </Button>
    </div>
  )
}
