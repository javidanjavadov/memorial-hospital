import * as z from "zod"
import { createValidators, type ValidationMessages } from "@/lib/validation"

/**
 * The patient details Google cannot supply.
 *
 * Built from a message bundle so the errors speak the visitor's language, and
 * validated again on the SERVER before anything is written into the session —
 * the form's copy is a convenience, the server's copy is what decides.
 */
export function createProfileSchema(messages: ValidationMessages) {
  const v = createValidators(messages)
  return z.object({
    firstName: v.firstName,
    lastName: v.lastName,
    fatherName: v.fatherName,
    gender: v.gender,
    birthDate: v.birthDate,
    phone: v.phoneNumber,
    finCode: v.requiredFinCode,
  })
}

export type ProfileSchema = ReturnType<typeof createProfileSchema>
export type ProfileInput = z.input<ProfileSchema>
export type ProfileData = z.output<ProfileSchema>

/** Soyad Ad Ata adı — the order used on Azerbaijani medical records. */
export const buildFullName = (parts: {
  firstName: string
  lastName: string
  fatherName: string
}) => `${parts.lastName} ${parts.firstName} ${parts.fatherName}`.trim()
