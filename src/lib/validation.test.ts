import { describe, expect, it } from "vitest"
import { azValidationMessages, createValidators } from "@/lib/validation"
import { createProfileSchema } from "@/lib/profile-schema"

/* The Azerbaijani bundle: these tests are about the rules, not the wording. */
const { birthDate, optionalFinCode, phoneNumber, requiredFinCode } =
  createValidators(azValidationMessages)
const profileSchema = createProfileSchema(azValidationMessages)

const valid = {
  firstName: "Aysel",
  lastName: "Məmmədova",
  fatherName: "Elxan",
  gender: "FEMALE" as const,
  birthDate: "1990-04-12",
  phone: "0557101050",
  finCode: "5jk8q2a",
}

describe("requiredFinCode", () => {
  it("accepts a well-formed code and stores it upper case", () => {
    expect(requiredFinCode.parse("5jk8q2a")).toBe("5JK8Q2A")
  })

  it("rejects the wrong length", () => {
    expect(requiredFinCode.safeParse("5JK8Q2").success).toBe(false)
    expect(requiredFinCode.safeParse("5JK8Q2AB").success).toBe(false)
  })

  /* What gets typed to get past a required field — and then printed on a report. */
  it("rejects a run of one character", () => {
    expect(requiredFinCode.safeParse("1111111").success).toBe(false)
    expect(requiredFinCode.safeParse("AAAAAAA").success).toBe(false)
  })
})

describe("optionalFinCode", () => {
  it("treats an untouched field as absent rather than invalid", () => {
    expect(optionalFinCode.parse("")).toBeUndefined()
    expect(optionalFinCode.parse(undefined)).toBeUndefined()
  })
})

describe("birthDate", () => {
  it("accepts a plausible date", () => {
    expect(birthDate.safeParse("1984-06-09").success).toBe(true)
  })

  it("rejects the future and the impossible past", () => {
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    expect(birthDate.safeParse(nextYear.toISOString().slice(0, 10)).success).toBe(
      false
    )
    expect(birthDate.safeParse("1850-01-01").success).toBe(false)
    expect(birthDate.safeParse("not-a-date").success).toBe(false)
  })
})

describe("phoneNumber", () => {
  it("accepts the formats people actually type", () => {
    for (const value of ["+994 55 710 10 50", "0557101050", "(055) 710-10-50"]) {
      expect(phoneNumber.safeParse(value).success, value).toBe(true)
    }
  })

  it("rejects too few digits", () => {
    expect(phoneNumber.safeParse("12345").success).toBe(false)
  })
})

describe("profileSchema", () => {
  it("accepts a complete profile", () => {
    expect(profileSchema.safeParse(valid).success).toBe(true)
  })

  /*
   * This schema is what /api/profile trusts. Every one of these is a field the
   * laboratory needs to match a sample to a person, so a blank must not pass.
   */
  it.each(["firstName", "lastName", "fatherName", "birthDate", "finCode", "phone"])(
    "rejects a profile missing %s",
    (field) => {
      expect(profileSchema.safeParse({ ...valid, [field]: "" }).success).toBe(false)
    }
  )

  it("rejects digits in a name", () => {
    expect(profileSchema.safeParse({ ...valid, firstName: "Ays3l" }).success).toBe(
      false
    )
  })
})
