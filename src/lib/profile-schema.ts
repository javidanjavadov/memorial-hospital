import * as z from "zod"
import {
  birthDate,
  fatherName,
  firstName,
  gender,
  lastName,
  phoneNumber,
  requiredFinCode,
} from "@/lib/validation"

/**
 * The patient details Google cannot supply.
 *
 * Validated on the SERVER before anything is written into the session cookie.
 * The same schema backs the form, so the two cannot drift — but the form's copy
 * is a convenience, and the server's copy is the one that decides.
 */
export const profileSchema = z.object({
  firstName,
  lastName,
  fatherName,
  gender,
  birthDate,
  phone: phoneNumber,
  finCode: requiredFinCode,
})

export type ProfileInput = z.input<typeof profileSchema>
export type ProfileData = z.output<typeof profileSchema>

/** Soyad Ad Ata adı — the order used on Azerbaijani medical records. */
export const buildFullName = (parts: {
  firstName: string
  lastName: string
  fatherName: string
}) => `${parts.lastName} ${parts.firstName} ${parts.fatherName}`.trim()
