import { create } from "zustand"
import { persist } from "zustand/middleware"
import { generateId, hashPassword, verifyPassword } from "@/lib/crypto"

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  finCode?: string
  createdAt: string
}

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
  login: (email: string, password: string) => Promise<AuthResult>
  register: (
    data: Omit<User, "id" | "createdAt"> & { password: string }
  ) => Promise<AuthResult>
  logout: () => void
  updateProfile: (data: Partial<Omit<User, "id" | "createdAt">>) => AuthResult
  addAppointment: (
    data: Omit<Appointment, "id" | "createdAt" | "status">
  ) => AuthResult
  cancelAppointment: (id: string) => AuthResult
  /** Looks up a stored profile by email, for linking a Google sign-in to an
   *  existing email/password account. Never exposes the password hash. */
  linkedProfile: (email: string) => User | null
  isSlotTaken: (branch: string, doctor: string | undefined, date: string, time: string) => boolean
}

const USERS_KEY = "memorial-users"
const APPOINTMENTS_KEY = "memorial-appointments"

type StoredUser = User & { passwordHash: string }

const normalizeEmail = (email: string) => email.trim().toLowerCase()

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

const getStoredUsers = () => readJson<StoredUser[]>(USERS_KEY, [])
const saveStoredUsers = (users: StoredUser[]) => writeJson(USERS_KEY, users)
const getStoredAppointments = () => readJson<Appointment[]>(APPOINTMENTS_KEY, [])
const saveStoredAppointments = (appointments: Appointment[]) =>
  writeJson(APPOINTMENTS_KEY, appointments)

const appointmentsFor = (userId: string, all = getStoredAppointments()) =>
  all.filter((a) => a.userId === userId)

/** Strips the password hash before anything reaches component state. */
const toPublicUser = ({ passwordHash, ...user }: StoredUser): User => {
  void passwordHash
  return user
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      appointments: [],
      hasHydrated: false,

      setHasHydrated: () => set({ hasHydrated: true }),

      login: async (email, password) => {
        const normalized = normalizeEmail(email)
        const users = getStoredUsers()
        const found = users.find((u) => normalizeEmail(u.email) === normalized)

        // Verify even when no account matched, so response time does not reveal
        // whether an email is registered.
        const matches = found
          ? await verifyPassword(password, found.passwordHash)
          : await verifyPassword(password, `pbkdf2$100000$${"0".repeat(32)}$${"0".repeat(64)}`)

        if (!found || !matches) {
          return { ok: false, error: "Email və ya şifrə düzgün deyil" }
        }

        const user = toPublicUser(found)
        set({ user, appointments: appointmentsFor(user.id) })
        return { ok: true }
      },

      register: async ({ password, ...data }) => {
        const normalized = normalizeEmail(data.email)
        const users = getStoredUsers()
        if (users.some((u) => normalizeEmail(u.email) === normalized)) {
          return { ok: false, error: "Bu email ilə artıq qeydiyyatdan keçilib" }
        }

        const newUser: StoredUser = {
          ...data,
          email: normalized,
          id: generateId(),
          createdAt: new Date().toISOString(),
          passwordHash: await hashPassword(password),
        }

        if (!saveStoredUsers([...users, newUser])) {
          return {
            ok: false,
            error: "Məlumatlar yaddaşa yazıla bilmədi. Brauzerin yaddaşını yoxlayın.",
          }
        }

        set({ user: toPublicUser(newUser), appointments: [] })
        return { ok: true }
      },

      logout: () => {
        set({ user: null, appointments: [] })
      },

      updateProfile: (data) => {
        const { user } = get()
        if (!user) return { ok: false, error: "Sessiya tapılmadı" }

        const users = getStoredUsers()
        const idx = users.findIndex((u) => u.id === user.id)
        if (idx === -1) return { ok: false, error: "İstifadəçi tapılmadı" }

        const next = { ...data }
        if (next.email !== undefined) {
          const normalized = normalizeEmail(next.email)
          // Without this check two accounts can share an email and login()
          // silently resolves to whichever was stored first.
          const taken = users.some(
            (u) => u.id !== user.id && normalizeEmail(u.email) === normalized
          )
          if (taken) {
            return { ok: false, error: "Bu email başqa hesaba aiddir" }
          }
          next.email = normalized
        }

        users[idx] = { ...users[idx], ...next }
        if (!saveStoredUsers(users)) {
          return { ok: false, error: "Məlumatlar yaddaşa yazıla bilmədi" }
        }

        set({ user: { ...user, ...next } })
        return { ok: true }
      },

      linkedProfile: (email) => {
        const normalized = normalizeEmail(email)
        const found = getStoredUsers().find(
          (u) => normalizeEmail(u.email) === normalized
        )
        return found ? toPublicUser(found) : null
      },

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
        const { user } = get()
        const userId = user?.id ?? data.userId
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
