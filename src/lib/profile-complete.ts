import type { User } from "@/lib/auth-store"
import type azDict from "@/i18n/dictionaries/az.json"

/**
 * The fields an order or an appointment cannot be accepted without.
 *
 * A Google sign-in supplies an email and a display name and nothing else, so an
 * account created that way starts out unusable: the laboratory identifies a
 * patient by FIN, prints Soyad Ad Ata adı on the report, and reads results
 * against age- and sex-dependent reference ranges. Ordering with these blank
 * produces a sample nobody can match to a person.
 */
export const REQUIRED_PROFILE_FIELDS = [
  { key: "lastName", label: "lastName" },
  { key: "firstName", label: "firstName" },
  { key: "fatherName", label: "fatherName" },
  { key: "birthDate", label: "birthDate" },
  { key: "finCode", label: "finCode" },
  { key: "phone", label: "phone" },
] as const satisfies ReadonlyArray<{
  key: keyof User
  /** A key in the dictionary's `profile` namespace, resolved where it is shown. */
  label: keyof (typeof azDict)["profile"]
}>

export type ProfileField = (typeof REQUIRED_PROFILE_FIELDS)[number]

/** Which required fields are still blank. Empty array means good to go. */
export function missingProfileFields(
  user: Pick<User, ProfileField["key"]> | null | undefined
): ProfileField[] {
  if (!user) return [...REQUIRED_PROFILE_FIELDS]
  return REQUIRED_PROFILE_FIELDS.filter(
    (field) => !String(user[field.key] ?? "").trim()
  )
}

export const isProfileComplete = (
  user: Pick<User, ProfileField["key"]> | null | undefined
) => missingProfileFields(user).length === 0
