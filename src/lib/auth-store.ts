import { create } from "zustand"
import { persist } from "zustand/middleware"

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

interface AuthState {
  user: User | null
  appointments: Appointment[]
  login: (email: string, password: string) => boolean
  register: (data: Omit<User, "id" | "createdAt"> & { password: string }) => boolean
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  addAppointment: (data: Omit<Appointment, "id" | "createdAt" | "status">) => void
  cancelAppointment: (id: string) => void
  getUserAppointments: () => Appointment[]
}

const generateId = () => Math.random().toString(36).substring(2, 15)

const getStoredUsers = (): (User & { password: string })[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("memorial-users")
  return stored ? JSON.parse(stored) : []
}

const saveStoredUsers = (users: (User & { password: string })[]) => {
  localStorage.setItem("memorial-users", JSON.stringify(users))
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      appointments: [],

      login: (email: string, password: string) => {
        const users = getStoredUsers()
        const found = users.find(
          (u) => u.email === email && u.password === password
        )
        if (found) {
          const { password: _, ...user } = found
          const storedAppointments = localStorage.getItem("memorial-appointments")
          const allAppointments: Appointment[] = storedAppointments
            ? JSON.parse(storedAppointments)
            : []
          const userAppointments = allAppointments.filter(
            (a) => a.userId === user.id
          )
          set({ user, appointments: userAppointments })
          return true
        }
        return false
      },

      register: (data) => {
        const users = getStoredUsers()
        const exists = users.find((u) => u.email === data.email)
        if (exists) return false

        const newUser: User & { password: string } = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        users.push(newUser)
        saveStoredUsers(users)

        const { password: _, ...user } = newUser
        set({ user, appointments: [] })
        return true
      },

      logout: () => {
        set({ user: null, appointments: [] })
      },

      updateProfile: (data) => {
        const { user } = get()
        if (!user) return
        const updatedUser = { ...user, ...data }
        set({ user: updatedUser })

        const users = getStoredUsers()
        const idx = users.findIndex((u) => u.id === user.id)
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...data }
          saveStoredUsers(users)
        }
      },

      addAppointment: (data) => {
        const { user } = get()
        const newAppointment: Appointment = {
          ...data,
          id: generateId(),
          status: "pending",
          createdAt: new Date().toISOString(),
        }

        const storedAppointments = localStorage.getItem("memorial-appointments")
        const allAppointments: Appointment[] = storedAppointments
          ? JSON.parse(storedAppointments)
          : []
        allAppointments.push(newAppointment)
        localStorage.setItem(
          "memorial-appointments",
          JSON.stringify(allAppointments)
        )

        const userAppointments = allAppointments.filter(
          (a) => a.userId === (user?.id || data.userId)
        )
        set({ appointments: userAppointments })
      },

      cancelAppointment: (id: string) => {
        const storedAppointments = localStorage.getItem("memorial-appointments")
        if (!storedAppointments) return
        const allAppointments: Appointment[] = JSON.parse(storedAppointments)
        const idx = allAppointments.findIndex((a) => a.id === id)
        if (idx !== -1) {
          allAppointments[idx].status = "cancelled"
          localStorage.setItem(
            "memorial-appointments",
            JSON.stringify(allAppointments)
          )
          const { user } = get()
          if (user) {
            const userAppointments = allAppointments.filter(
              (a) => a.userId === user.id
            )
            set({ appointments: userAppointments })
          }
        }
      },

      getUserAppointments: () => {
        return get().appointments
      },
    }),
    {
      name: "memorial-auth",
      partialize: (state) => ({
        user: state.user,
        appointments: state.appointments,
      }),
    }
  )
)
