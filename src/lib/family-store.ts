import { create } from "zustand"
import { persist } from "zustand/middleware"
import { generateId } from "@/lib/crypto"
import type { Gender } from "@/lib/auth-store"
import type azDict from "@/i18n/dictionaries/az.json"

/**
 * How the member is related to the account holder.
 *
 * A label, not a rule: nothing downstream branches on it. It exists so a
 * dropdown of four people with similar surnames can be told apart at a glance
 * — "Cavadov Kanan (oğlu)" rather than three near-identical names.
 */
export const RELATIONS = ["spouse", "child", "parent", "sibling", "other"] as const

export type Relation = (typeof RELATIONS)[number]

/**
 * A relative the account holder may book and order for.
 *
 * Carries the same identifying fields as the account holder's own profile, and
 * for the same reason: the laboratory matches a sample to a person by FIN and
 * reads the result against age- and sex-dependent reference ranges. A member
 * added with those blank is a patient nobody can file a result against, so the
 * form that writes this refuses to save without them.
 */
export interface FamilyMember {
  id: string
  /**
   * The account this member hangs off.
   *
   * The store is one browser's localStorage and a browser is shared — a family,
   * a reception desk. Without this, signing in as someone else would show you
   * their relatives, which here means their names, dates of birth and FIN codes.
   */
  ownerId: string
  firstName: string
  lastName: string
  /** Patronymic. Standard on Azerbaijani records and required by the lab. */
  fatherName: string
  /** Derived from the parts on save — two sources for one value drift apart. */
  fullName: string
  gender: Gender
  /** ISO `yyyy-mm-dd`. Reference ranges are age-dependent. */
  birthDate: string
  finCode: string
  /** Optional: a child has no phone of their own, and the account holder's
   *  number is the one reception will ring. */
  phone: string
  relation: Relation
  createdAt: string
}

/** The fields a caller supplies; the store derives the rest. */
export type FamilyMemberInput = Omit<
  FamilyMember,
  "id" | "ownerId" | "fullName" | "createdAt"
>

/** See the note on AuthResult: the store names the failure, the view words it. */
export type FamilyResult =
  | { ok: true; id: string }
  | { ok: false; error: keyof (typeof azDict)["ui"] }

/**
 * A ceiling, so a stuck loop or a bored visitor cannot fill localStorage with
 * relatives. Nobody books for more than a handful of people.
 */
export const MAX_FAMILY_MEMBERS = 12

interface FamilyState {
  members: FamilyMember[]
  hasHydrated: boolean
  setHasHydrated: () => void
  addMember: (ownerId: string, input: FamilyMemberInput) => FamilyResult
  updateMember: (
    ownerId: string,
    id: string,
    input: FamilyMemberInput
  ) => FamilyResult
  removeMember: (ownerId: string, id: string) => FamilyResult
}

/** Soyad Ad Ata adı — the order used on Azerbaijani medical records. */
export const buildMemberName = (
  parts: Pick<FamilyMember, "firstName" | "lastName" | "fatherName">
) => `${parts.lastName} ${parts.firstName} ${parts.fatherName}`.trim()

/**
 * The relatives one account may act for.
 *
 * Local to this browser, like the appointments and the order history it sits
 * beside — there is no database in this build. It is deliberately NOT in the
 * session cookie: that cookie is capped at about 4KB and a dozen members with
 * full details would silently overflow it, which fails by dropping the whole
 * session rather than by refusing the twelfth member.
 */
export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      members: [],
      hasHydrated: false,

      setHasHydrated: () => set({ hasHydrated: true }),

      addMember: (ownerId, input) => {
        if (!ownerId) return { ok: false, error: "sessionNotFound" }

        const mine = get().members.filter((m) => m.ownerId === ownerId)
        if (mine.length >= MAX_FAMILY_MEMBERS) {
          return { ok: false, error: "familyLimitReached" }
        }

        /*
         * One FIN, one person. Adding the same relative twice produces two
         * patients the laboratory cannot tell apart, and results filed against
         * whichever of them the order happened to name.
         */
        const finCode = input.finCode.trim().toUpperCase()
        if (mine.some((m) => m.finCode.toUpperCase() === finCode)) {
          return { ok: false, error: "familyDuplicateFin" }
        }

        const member: FamilyMember = {
          ...input,
          finCode,
          id: generateId(),
          ownerId,
          fullName: buildMemberName(input),
          createdAt: new Date().toISOString(),
        }

        set((state) => ({ members: [...state.members, member] }))
        return { ok: true, id: member.id }
      },

      updateMember: (ownerId, id, input) => {
        if (!ownerId) return { ok: false, error: "sessionNotFound" }

        const { members } = get()
        const index = members.findIndex((m) => m.id === id)
        if (index === -1) return { ok: false, error: "familyMemberNotFound" }
        // Ownership check: without it any id in this browser could be edited.
        if (members[index].ownerId !== ownerId) {
          return { ok: false, error: "familyMemberNotFound" }
        }

        const finCode = input.finCode.trim().toUpperCase()
        const clash = members.some(
          (m) =>
            m.id !== id &&
            m.ownerId === ownerId &&
            m.finCode.toUpperCase() === finCode
        )
        if (clash) return { ok: false, error: "familyDuplicateFin" }

        const next = [...members]
        next[index] = {
          ...next[index],
          ...input,
          finCode,
          fullName: buildMemberName(input),
        }

        set({ members: next })
        return { ok: true, id }
      },

      removeMember: (ownerId, id) => {
        if (!ownerId) return { ok: false, error: "sessionNotFound" }

        const { members } = get()
        const target = members.find((m) => m.id === id)
        if (!target || target.ownerId !== ownerId) {
          return { ok: false, error: "familyMemberNotFound" }
        }

        set({ members: members.filter((m) => m.id !== id) })
        return { ok: true, id }
      },
    }),
    {
      name: "memorial-family",
      // Hydrate manually so the server markup and the first client render
      // agree. See <StoreHydration />.
      skipHydration: true,
      partialize: (state) => ({ members: state.members }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated()
      },
    }
  )
)

/** This browser's family members belonging to one account, oldest first. */
export const membersFor = (
  members: FamilyMember[],
  ownerId: string | undefined
) => (ownerId ? members.filter((m) => m.ownerId === ownerId) : [])
