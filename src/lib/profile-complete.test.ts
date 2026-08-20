import az from "@/i18n/dictionaries/az.json"
import { describe, expect, it } from "vitest"
import {
  isProfileComplete,
  missingProfileFields,
  REQUIRED_PROFILE_FIELDS,
} from "@/lib/profile-complete"

const complete = {
  firstName: "Aysel",
  lastName: "Məmmədova",
  fatherName: "Elxan",
  birthDate: "1990-04-12",
  finCode: "5JK8Q2A",
  phone: "0557101050",
}

describe("missingProfileFields", () => {
  it("reports nothing missing on a complete profile", () => {
    expect(missingProfileFields(complete)).toEqual([])
    expect(isProfileComplete(complete)).toBe(true)
  })

  /* A Google sign-in arrives with every one of these blank. */
  it("reports every field for a signed-out or empty visitor", () => {
    expect(missingProfileFields(null)).toHaveLength(REQUIRED_PROFILE_FIELDS.length)
  })

  it("treats whitespace as blank", () => {
    expect(missingProfileFields({ ...complete, finCode: "   " })).toHaveLength(1)
  })

  it("names the field that is missing, for the prompt", () => {
    const missing = missingProfileFields({ ...complete, birthDate: "" })
    expect(missing.map((f) => f.key)).toEqual(["birthDate"])
    /* The label is a dictionary key now, resolved where it is shown, so the
       prompt can name the field in the visitor's language. */
    expect(missing[0].label).toBe("birthDate")
    expect(az.profile[missing[0].label]).toBe("Doğum tarixi")
  })
})
