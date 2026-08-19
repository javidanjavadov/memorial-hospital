import * as z from "zod"

/**
 * Zod's `.optional()` accepts `undefined` — but an untouched text input submits
 * `""`, which then fails `.email()` / `.length()` and blocks the form. Every
 * genuinely optional field must therefore accept "" and normalise it away.
 *
 * A `z.union([z.literal(""), …])` is used rather than `z.preprocess`, because
 * preprocess widens the schema's *input* type to `unknown`, which react-hook-form
 * cannot reconcile with its resolver generics.
 */
const optional = <T extends z.ZodType<string>>(schema: T) =>
  z
    .union([z.literal(""), schema])
    .optional()
    .transform((value) => (value === "" ? undefined : value))

export const optionalEmail = optional(
  z.string().email("Düzgün email daxil edin")
)

/** Azerbaijani FIN: exactly 7 alphanumeric characters, optional. */
export const optionalFinCode = optional(
  z
    .string()
    .regex(/^[A-Za-z0-9]{7}$/, "FIN kod 7 hərf və ya rəqəmdən ibarət olmalıdır")
)

export const optionalText = (max: number, message: string) =>
  optional(z.string().max(max, message))

export const requiredEmail = z
  .string()
  .min(1, "Email daxil edin")
  .email("Düzgün email daxil edin")

/**
 * Accepts the local formats people actually type: +994 55 710 10 50,
 * 0557101050, (055) 710-10-50 …
 */
export const phoneNumber = z
  .string()
  .min(1, "Telefon nömrəsi daxil edin")
  .refine(
    (value) => {
      const digits = value.replace(/\D/g, "")
      return digits.length >= 9 && digits.length <= 15
    },
    { message: "Telefon nömrəsi 9–15 rəqəmdən ibarət olmalıdır" }
  )

/** One name part: no digits, no separators — those belong in their own field. */
const namePart = (label: string) =>
  z
    .string()
    .min(2, `${label} minimum 2 simvol olmalıdır`)
    .max(50, `${label} maksimum 50 simvol ola bilər`)
    .regex(
      /^[\p{L}\s'-]+$/u,
      `${label} yalnız hərflərdən ibarət ola bilər`
    )

export const firstName = namePart("Ad")
export const lastName = namePart("Soyad")
export const fatherName = namePart("Ata adı")

export const gender = z.enum(["MALE", "FEMALE"], {
  message: "Cinsi seçin",
})

/** Mandatory at registration; the booking form still accepts it as optional. */
export const requiredFinCode = z
  .string()
  .min(1, "FIN kod daxil edin")
  .regex(/^[A-Za-z0-9]{7}$/, "FIN kod 7 hərf və ya rəqəmdən ibarət olmalıdır")

/**
 * Date of birth, as an ISO `yyyy-mm-dd` string from a native date input.
 *
 * Mandatory: it is one of the three things the results lookup checks, and a
 * reference range is meaningless without an age — the same haemoglobin figure
 * is normal in an adult and low in a newborn.
 *
 * Bounded at both ends because a date input accepts anything typed into it: a
 * future date is impossible, and beyond 120 years is a typo rather than a
 * patient, most often a mistyped year that would then follow the record around.
 */
export const birthDate = z
  .string()
  .min(1, "Doğum tarixini seçin")
  .refine((value) => {
    const date = new Date(value)
    if (Number.isNaN(date.valueOf())) return false
    const oldest = new Date()
    oldest.setFullYear(oldest.getFullYear() - 120)
    return date <= new Date() && date >= oldest
  }, "Doğum tarixi düzgün deyil")

export const fullName = z
  .string()
  .min(3, "Ad minimum 3 simvol olmalıdır")
  .max(100, "Ad maksimum 100 simvol ola bilər")
  .refine((value) => value.trim().includes(" "), {
    message: "Ad və soyadınızı tam yazın",
  })

export const password = z
  .string()
  .min(8, "Şifrə minimum 8 simvol olmalıdır")
  .max(128, "Şifrə maksimum 128 simvol ola bilər")
  .refine((value) => /[A-Za-zƏÜÖĞİŞÇəüöğışç]/.test(value) && /\d/.test(value), {
    message: "Şifrə ən azı bir hərf və bir rəqəm daxil etməlidir",
  })
