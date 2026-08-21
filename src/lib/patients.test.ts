import { describe, expect, it } from "vitest"
import { shouldAskForPatient } from "@/lib/patients"

/** A signed-in account with relatives, on a visit it has not answered yet. */
const asking = {
  isLoading: false,
  isSignedIn: true,
  patientCount: 3,
  answered: false,
}

describe("shouldAskForPatient", () => {
  it("asks an account with relatives", () => {
    expect(shouldAskForPatient(asking)).toBe(true)
  })

  /*
   * The family list arrives from localStorage a tick after the first render.
   * Asking during that tick would show a chooser holding only the account
   * holder, then have it change underneath them.
   */
  it("stays quiet while the family list is still loading", () => {
    expect(shouldAskForPatient({ ...asking, isLoading: true })).toBe(false)
  })

  /* A guest has no patients at all, and is still allowed to browse and price
     up a basket — see the note in the middleware on why. */
  it("never interrupts a signed-out visitor", () => {
    expect(shouldAskForPatient({ ...asking, isSignedIn: false })).toBe(false)
  })

  it("does not ask when the account holder is the only patient", () => {
    expect(shouldAskForPatient({ ...asking, patientCount: 1 })).toBe(false)
  })

  it("closes once answered on this visit", () => {
    expect(shouldAskForPatient({ ...asking, answered: true })).toBe(false)
  })

  /*
   * Asked on EVERY arrival, which is the point of `answered` being per-visit
   * component state rather than anything persisted.
   *
   * A previous visit's choice must not stand in for this one: ordering a test
   * against the wrong member of a family is a sample drawn under one name and a
   * result filed under another. A fresh visit starts with answered=false, so
   * even an account that has chosen many times before is asked again.
   */
  it("asks again on a fresh visit, however many times it was answered before", () => {
    const freshVisit = { ...asking, answered: false }
    expect(shouldAskForPatient(freshVisit)).toBe(true)
  })
})
