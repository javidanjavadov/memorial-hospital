import * as z from "zod"
import azMessages from "@/i18n/dictionaries/az.json"
import { fill } from "@/i18n/format"

/**
 * Form validators, built from a message bundle.
 *
 * A validation message is text a patient reads, so it has to follow the same
 * language as the rest of the page. Zod bakes its messages into the schema at
 * construction, so the schema cannot be a module constant any more — it is
 * built from the dictionary where it is used.
 *
 * Zod's `.optional()` accepts `undefined`, but an untouched text input submits
 * `""`, which then fails `.email()` / `.length()` and blocks the form. Every
 * genuinely optional field therefore accepts "" and normalises it away.
 *
 * `z.union([z.literal(""), …])` rather than `z.preprocess`, because preprocess
 * widens the schema's *input* type to `unknown`, which react-hook-form cannot
 * reconcile with its resolver generics.
 */
export type ValidationMessages = typeof azMessages.validation

/** Azerbaijani, for server code and tests that have no request behind them. */
export const azValidationMessages: ValidationMessages = azMessages.validation

const optional = <T extends z.ZodType<string>>(schema: T) =>
  z
    .union([z.literal(""), schema])
    .optional()
    .transform((value) => (value === "" ? undefined : value))

/** 7 characters, letters and digits. */
const FIN_PATTERN = /^[A-Za-z0-9]{7}$/

/** Printed on the card in upper case; stored that way so lookups match. */
const normalizeFin = (value: string) => value.trim().toUpperCase()

export function createValidators(m: ValidationMessages) {
  const namePart = (label: string) =>
    z
      .string()
      .min(2, fill(m.nameMin, { label, min: 2 }))
      .max(50, fill(m.nameMax, { label, max: 50 }))
      .regex(/^[\p{L}\s'-]+$/u, fill(m.nameLettersOnly, { label }))

  return {
    optionalEmail: optional(z.string().email(m.emailInvalid)),

    optionalFinCode: optional(
      z
        .string()
        .transform(normalizeFin)
        .refine((value) => FIN_PATTERN.test(value), m.finFormat)
    ),

    optionalText: (max: number, message?: string) =>
      optional(z.string().max(max, message ?? fill(m.textMax, { max }))),

    /**
     * A phone number that may be left blank, checked the same way when it is not.
     *
     * For a family member: a child has no number of their own, and reception
     * rings the account holder about them. Blank is a real answer here, but a
     * half-typed one is still a mistake worth catching.
     */
    optionalPhoneNumber: optional(
      z.string().refine((value) => {
        const digits = value.replace(/\D/g, "")
        return digits.length >= 9 && digits.length <= 15
      }, m.phoneDigits)
    ),

    requiredEmail: z.string().min(1, m.emailRequired).email(m.emailInvalid),

    /** Accepts what people actually type: +994 55 710 10 50, 0557101050, (055) 710-10-50. */
    phoneNumber: z
      .string()
      .min(1, m.phoneRequired)
      .refine((value) => {
        const digits = value.replace(/\D/g, "")
        return digits.length >= 9 && digits.length <= 15
      }, m.phoneDigits),

    firstName: namePart(m.firstNameLabel),
    lastName: namePart(m.lastNameLabel),
    fatherName: namePart(m.fatherNameLabel),

    gender: z.enum(["MALE", "FEMALE"], { message: m.genderRequired }),

    /**
     * Azerbaijani FIN.
     *
     * This checks the shape and nothing more, and that is the honest limit of
     * what a website can do. A FIN carries no published check digit, so a
     * well-formed string cannot be told apart from a real one without querying
     * the state population register, which is not a public API. A guessed
     * checksum would reject valid cards and accept invented ones, so the code
     * is a claim until someone checks it against the identity document at the
     * branch — and both forms say so.
     */
    requiredFinCode: z
      .string()
      .min(1, m.finRequired)
      .transform(normalizeFin)
      .refine((value) => FIN_PATTERN.test(value), m.finFormat)
      // A run of one character is not a FIN. It is what gets typed to get past
      // a required field, and it would then be printed on a laboratory report.
      .refine((value) => new Set(value).size > 1, m.finInvalid),

    /**
     * ISO `yyyy-mm-dd` from a native date input.
     *
     * Bounded at both ends because a date input accepts anything typed into it:
     * a future date is impossible, and beyond 120 years is a typo rather than a
     * patient — most often a mistyped year that would then follow the record
     * around.
     */
    birthDate: z
      .string()
      .min(1, m.birthDateRequired)
      .refine((value) => {
        const date = new Date(value)
        if (Number.isNaN(date.valueOf())) return false
        const oldest = new Date()
        oldest.setFullYear(oldest.getFullYear() - 120)
        return date <= new Date() && date >= oldest
      }, m.birthDateInvalid),

    fullName: z
      .string()
      .min(3, m.fullNameMin)
      .max(100, m.fullNameMax)
      .refine((value) => value.trim().includes(" "), {
        message: m.fullNameComplete,
      }),

    password: z
      .string()
      .min(8, m.passwordMin)
      .max(128, m.passwordMax)
      .refine(
        (value) => /[A-Za-zƏÜÖĞİŞÇəüöğışç]/.test(value) && /\d/.test(value),
        { message: m.passwordComplexity }
      ),
  }
}

export type Validators = ReturnType<typeof createValidators>
