import { beforeEach, describe, expect, it } from "vitest"
import {
  MAX_FAMILY_MEMBERS,
  buildMemberName,
  membersFor,
  useFamilyStore,
  type FamilyMemberInput,
} from "@/lib/family-store"

const OWNER = "owner-1"
const OTHER = "owner-2"

const input = (overrides: Partial<FamilyMemberInput> = {}): FamilyMemberInput => ({
  firstName: "Aysel",
  lastName: "Cavadova",
  fatherName: "Kanan",
  gender: "FEMALE",
  birthDate: "1990-04-11",
  finCode: "1A2B3C4",
  phone: "",
  relation: "spouse",
  ...overrides,
})

beforeEach(() => {
  useFamilyStore.setState({ members: [], hasHydrated: true })
})

describe("buildMemberName", () => {
  it("writes Soyad Ad Ata adı, the order on Azerbaijani records", () => {
    expect(
      buildMemberName({
        firstName: "Aysel",
        lastName: "Cavadova",
        fatherName: "Kanan",
      })
    ).toBe("Cavadova Aysel Kanan")
  })
})

describe("addMember", () => {
  it("stores the member against the account that added them", () => {
    const result = useFamilyStore.getState().addMember(OWNER, input())
    expect(result.ok).toBe(true)

    const [member] = useFamilyStore.getState().members
    expect(member.ownerId).toBe(OWNER)
    expect(member.fullName).toBe("Cavadova Aysel Kanan")
  })

  /* Printed on the card in upper case; stored that way so lookups match. */
  it("normalises the FIN to upper case", () => {
    useFamilyStore.getState().addMember(OWNER, input({ finCode: "a1b2c3d" }))
    expect(useFamilyStore.getState().members[0].finCode).toBe("A1B2C3D")
  })

  /*
   * Two members with one FIN are two patients the laboratory cannot tell
   * apart, and a result filed against whichever the order happened to name.
   */
  it("refuses a second member with the same FIN", () => {
    useFamilyStore.getState().addMember(OWNER, input())
    const result = useFamilyStore
      .getState()
      .addMember(OWNER, input({ firstName: "Nigar", finCode: "1a2b3c4" }))

    expect(result).toEqual({ ok: false, error: "familyDuplicateFin" })
    expect(useFamilyStore.getState().members).toHaveLength(1)
  })

  /* The clash is per account: two families may each contain that person. */
  it("allows the same FIN under a different account", () => {
    useFamilyStore.getState().addMember(OWNER, input())
    expect(useFamilyStore.getState().addMember(OTHER, input()).ok).toBe(true)
    expect(useFamilyStore.getState().members).toHaveLength(2)
  })

  it("stops at the ceiling", () => {
    for (let i = 0; i < MAX_FAMILY_MEMBERS; i++) {
      const finCode = `FIN${String(i).padStart(4, "0")}`
      expect(useFamilyStore.getState().addMember(OWNER, input({ finCode })).ok).toBe(
        true
      )
    }

    const result = useFamilyStore
      .getState()
      .addMember(OWNER, input({ finCode: "OVERFLW" }))
    expect(result).toEqual({ ok: false, error: "familyLimitReached" })
  })

  it("refuses to add anything without an account", () => {
    expect(useFamilyStore.getState().addMember("", input())).toEqual({
      ok: false,
      error: "sessionNotFound",
    })
  })
})

describe("updateMember", () => {
  it("rebuilds the display name from the parts", () => {
    const added = useFamilyStore.getState().addMember(OWNER, input())
    const id = added.ok ? added.id : ""

    useFamilyStore.getState().updateMember(OWNER, id, input({ lastName: "Əliyeva" }))
    expect(useFamilyStore.getState().members[0].fullName).toBe(
      "Əliyeva Aysel Kanan"
    )
  })

  /* Without this, any id in this browser could be edited by any account. */
  it("refuses to edit another account's member", () => {
    const added = useFamilyStore.getState().addMember(OWNER, input())
    const id = added.ok ? added.id : ""

    expect(
      useFamilyStore.getState().updateMember(OTHER, id, input({ firstName: "Leyla" }))
    ).toEqual({ ok: false, error: "familyMemberNotFound" })
    expect(useFamilyStore.getState().members[0].firstName).toBe("Aysel")
  })

  it("still refuses a FIN that another member already has", () => {
    useFamilyStore.getState().addMember(OWNER, input())
    const second = useFamilyStore
      .getState()
      .addMember(OWNER, input({ firstName: "Nigar", finCode: "9Z8Y7X6" }))
    const id = second.ok ? second.id : ""

    expect(
      useFamilyStore.getState().updateMember(OWNER, id, input({ finCode: "1A2B3C4" }))
    ).toEqual({ ok: false, error: "familyDuplicateFin" })
  })

  /* Editing a member without touching their FIN must not clash with itself. */
  it("allows a member to keep their own FIN", () => {
    const added = useFamilyStore.getState().addMember(OWNER, input())
    const id = added.ok ? added.id : ""

    expect(
      useFamilyStore.getState().updateMember(OWNER, id, input({ firstName: "Leyla" }))
        .ok
    ).toBe(true)
  })
})

describe("removeMember", () => {
  it("refuses to remove another account's member", () => {
    const added = useFamilyStore.getState().addMember(OWNER, input())
    const id = added.ok ? added.id : ""

    expect(useFamilyStore.getState().removeMember(OTHER, id)).toEqual({
      ok: false,
      error: "familyMemberNotFound",
    })
    expect(useFamilyStore.getState().members).toHaveLength(1)
  })
})

describe("membersFor", () => {
  /*
   * A browser is shared — a family, a reception desk. Leaking the list would
   * mean leaking names, dates of birth and FIN codes.
   */
  it("shows an account only its own members", () => {
    useFamilyStore.getState().addMember(OWNER, input())
    useFamilyStore
      .getState()
      .addMember(OTHER, input({ firstName: "Leyla", finCode: "5Q6R7S8" }))

    const { members } = useFamilyStore.getState()
    expect(membersFor(members, OWNER)).toHaveLength(1)
    expect(membersFor(members, OWNER)[0].firstName).toBe("Aysel")
  })

  it("shows nothing when nobody is signed in", () => {
    useFamilyStore.getState().addMember(OWNER, input())
    expect(membersFor(useFamilyStore.getState().members, undefined)).toEqual([])
  })
})
