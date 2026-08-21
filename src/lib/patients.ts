"use client"

import { useMemo } from "react"
import { membersFor, useFamilyStore, type Relation } from "@/lib/family-store"
import { useCurrentUser } from "@/lib/use-current-user"

/**
 * Someone an order or an appointment can be placed for.
 *
 * The account holder and their relatives reach the booking form and the basket
 * through the same shape, so nothing downstream has to ask which of the two it
 * is holding. `relation` is "self" for the account holder — the one value a
 * FamilyMember can never carry — which is also how a patient id is recognised
 * as the account holder without comparing it against the session.
 */
export interface Patient {
  /** The account id for the holder, the member id for a relative. */
  id: string
  fullName: string
  firstName: string
  lastName: string
  fatherName: string
  gender: "MALE" | "FEMALE"
  birthDate: string
  finCode: string
  phone: string
  /** Only the account holder has one; reception rings this for a child. */
  email: string
  relation: "self" | Relation
}

export const isSelf = (patient: Pick<Patient, "relation">) =>
  patient.relation === "self"

/**
 * Everyone this account may act for: the holder first, then their relatives.
 *
 * `isSingle` is the question the booking form actually asks. Someone with no
 * relatives has nothing to choose between, so making them confirm "yes, this
 * appointment is for me" on a screen of its own is a step that only ever has
 * one answer — the form skips it. The moment a second person exists the choice
 * is real and the step becomes mandatory, with nothing preselected: defaulting
 * to the account holder is how a child's appointment gets filed under a parent.
 */
export function usePatients(): {
  patients: Patient[]
  self: Patient | null
  isSingle: boolean
  isLoading: boolean
} {
  const { user, isLoading } = useCurrentUser()
  const members = useFamilyStore((s) => s.members)
  const hasHydrated = useFamilyStore((s) => s.hasHydrated)

  const self = useMemo<Patient | null>(
    () =>
      user
        ? {
            id: user.id,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            fatherName: user.fatherName,
            gender: user.gender,
            birthDate: user.birthDate,
            finCode: user.finCode,
            phone: user.phone,
            email: user.email,
            relation: "self",
          }
        : null,
    [user]
  )

  const patients = useMemo<Patient[]>(() => {
    if (!self) return []
    /*
     * Before the store has read localStorage there are no relatives to show.
     * Treating that moment as "this account has no family" would let the
     * booking form skip the choice and file the appointment against the
     * account holder, so every caller waits on `isLoading` instead.
     */
    if (!hasHydrated) return [self]

    return [
      self,
      ...membersFor(members, self.id).map<Patient>((member) => ({
        id: member.id,
        fullName: member.fullName,
        firstName: member.firstName,
        lastName: member.lastName,
        fatherName: member.fatherName,
        gender: member.gender,
        birthDate: member.birthDate,
        finCode: member.finCode,
        // Reception rings the account holder about a relative who gave no
        // number of their own.
        phone: member.phone || self.phone,
        email: self.email,
        relation: member.relation,
      })),
    ]
  }, [self, members, hasHydrated])

  return {
    patients,
    self,
    isSingle: patients.length <= 1,
    isLoading: isLoading || !hasHydrated,
  }
}

/** Looks a patient up by id, tolerating an id that no longer exists. */
export const findPatient = (patients: Patient[], id: string | null | undefined) =>
  patients.find((patient) => patient.id === id) ?? null

/**
 * Whether to ask, on arrival, who the order is for.
 *
 * Extracted from the catalogue page so the rule can be tested: it decides
 * whether a dialog interrupts someone, and every one of its inputs arrives
 * asynchronously, which is exactly the shape of condition that goes wrong
 * silently. Asking while the family list is still loading would greet a lone
 * account holder with a chooser containing only themselves.
 *
 * Asked on EVERY arrival, not once and remembered. Ordering a test for the
 * wrong member of a family is not a cosmetic mistake — it is a sample drawn
 * under one person's name and a result filed against another — so the question
 * is put every time the catalogue is opened rather than inherited from whatever
 * was chosen on a previous visit. `answered` is per-visit state in the
 * component, so it closes the dialog for this visit and nothing longer.
 */
export function shouldAskForPatient(state: {
  isLoading: boolean
  isSignedIn: boolean
  patientCount: number
  /** Chosen or dismissed on THIS visit. Never persisted. */
  answered: boolean
}): boolean {
  if (state.isLoading) return false
  if (!state.isSignedIn) return false
  // Nothing to choose between: the account holder is the only patient.
  if (state.patientCount <= 1) return false
  return !state.answered
}
