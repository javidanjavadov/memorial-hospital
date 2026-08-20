import { create } from "zustand"
import { persist } from "zustand/middleware"
import { generateId } from "@/lib/crypto"

export type Gender = "MALE" | "FEMALE"

export interface User {
  id: string
  firstName: string
  lastName: string
  /** Patronymic. Standard on Azerbaijani records and required by the lab. */
  fatherName: string
  gender: Gender
  /**
   * Display name, derived from the parts on save rather than stored
   * independently — two sources for one value drift apart.
   */
  fullName: string
  email: string
  phone: string
  /** Mandatory: the lab identifies patients by FIN. */
  finCode: string
  /** ISO `yyyy-mm-dd`. Mandatory — reference ranges are age-dependent. */
  birthDate: string
  createdAt: string
}

/** Soyad Ad Ata adı — the order used on Azerbaijani medical records. */
export const buildFullName = (
  parts: Pick<User, "firstName" | "lastName" | "fatherName">
) => `${parts.lastName} ${parts.firstName} ${parts.fatherName}`.trim()

export interface Appointment {
  id: string
  userId: string
  fullName: string
  phone: string
  email?: string
  finCode?: string
  department: string
  doctor?: string
  branch: string
  date: string
  time: string
  complaint?: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: string
}

export type AuthResult = { ok: true } | { ok: false; error: string }

interface AuthState {
  user: User | null
  appointments: Appointment[]
  /** False until zustand has read localStorage. Guards against redirecting a
   *  logged-in user to /giris during the first client render. */
  hasHydrated: boolean
  setHasHydrated: () => void
  addAppointment: (
    data: Omit<Appointment, "id" | "createdAt" | "status">
  ) => AuthResult
  cancelAppointment: (id: string) => AuthResult
  isSlotTaken: (branch: string, doctor: string | undefined, date: string, time: string) => boolean
}

const APPOINTMENTS_KEY = "memorial-appointments"

/** localStorage reads that never throw — private mode and quota errors included. */
const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key: string, value: unknown): boolean => {
  if (typeof window === "undefined") return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

const getStoredAppointments = () => readJson<Appointment[]>(APPOINTMENTS_KEY, [])
const saveStoredAppointments = (appointments: Appointment[]) =>
  writeJson(APPOINTMENTS_KEY, appointments)

const appointmentsFor = (userId: string, all = getStoredAppointments()) =>
  all.filter((a) => a.userId === userId)

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      appointments: [],
      hasHydrated: false,

      setHasHydrated: () => set({ hasHydrated: true }),

      isSlotTaken: (branch, doctor, date, time) => {
        if (!doctor) return false
        return getStoredAppointments().some(
          (a) =>
            a.status !== "cancelled" &&
            a.branch === branch &&
            a.doctor === doctor &&
            a.date === date &&
            a.time === time
        )
      },

      addAppointment: (data) => {
        // The session, not this store, decides who is signed in — the caller
        // passes the id it got from the server.
        const userId = data.userId
        const all = getStoredAppointments()

        // Double-booking guard. Without it the same doctor can be booked by any
        // number of patients for the identical slot.
        const clash = all.some(
          (a) =>
            a.status !== "cancelled" &&
            !!data.doctor &&
            a.doctor === data.doctor &&
            a.branch === data.branch &&
            a.date === data.date &&
            a.time === data.time
        )
        if (clash) {
          return {
            ok: false,
            error: "Bu vaxt artıq doludur. Zəhmət olmasa başqa vaxt seçin.",
          }
        }

        const newAppointment: Appointment = {
          ...data,
          userId,
          id: generateId(),
          status: "pending",
          createdAt: new Date().toISOString(),
        }

        if (!saveStoredAppointments([...all, newAppointment])) {
          return { ok: false, error: "Qəbul yaddaşa yazıla bilmədi" }
        }

        set({ appointments: appointmentsFor(userId, [...all, newAppointment]) })
        return { ok: true }
      },

      cancelAppointment: (id) => {
        const { user } = get()
        if (!user) return { ok: false, error: "Sessiya tapılmadı" }

        const all = getStoredAppointments()
        const idx = all.findIndex((a) => a.id === id)
        if (idx === -1) return { ok: false, error: "Qəbul tapılmadı" }

        // Ownership check: previously any id could be cancelled by anyone.
        if (all[idx].userId !== user.id) {
          return { ok: false, error: "Bu qəbulu ləğv etmək icazəniz yoxdur" }
        }

        all[idx] = { ...all[idx], status: "cancelled" }
        if (!saveStoredAppointments(all)) {
          return { ok: false, error: "Dəyişiklik yaddaşa yazıla bilmədi" }
        }

        set({ appointments: appointmentsFor(user.id, all) })
        return { ok: true }
      },
    }),
    {
      name: "memorial-auth",
      // Hydrate manually so the server-rendered markup (logged out) matches the
      // first client render, then rehydrate in an effect. See <StoreHydration />.
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        appointments: state.appointments,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated()
      },
    }
  )
)
