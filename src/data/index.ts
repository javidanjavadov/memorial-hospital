import {
  Heart,
  Brain,
  Stethoscope,
  Baby,
  Bone,
  Eye,
  Syringe,
  Activity,
  Shield,
  Users,
  MapPin,
  type LucideIcon,
} from "lucide-react"

export interface Doctor {
  id: string
  name: string
  specialty: string
  department: string
  /** Canonical branch id — must match a `Branch.id`. Used for all filtering. */
  branchId: string
  /** Short display name of the branch. Never compare against this. */
  branch: string
  experience: number
  rating: number
  available: boolean
  languages: string[]
  education: string
}

export interface Department {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
}

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  workingHours: string
  mapUrl: string
}

export interface Service {
  id: string
  name: string
  description: string
  price: string
  duration: string
  icon: LucideIcon
}

export const departments: Department[] = [
  {
    id: "kardiologiya",
    name: "Kardiologiya",
    description: "Ürək və damar xəstəliklərinin diaqnostikası və müalicəsi",
    icon: Heart,
    color: "from-rose-500 to-red-500",
  },
  {
    id: "nevrologiya",
    name: "Nevrologiya",
    description: "Sinir sistemi xəstəliklərinin müalicəsi",
    icon: Brain,
    color: "from-teal-700 to-teal-500",
  },
  {
    id: "terapiya",
    name: "Terapiya",
    description: "Ümumi terapevtik müayinə və müalicə",
    icon: Stethoscope,
    color: "from-teal-500 to-teal-300",
  },
  {
    id: "pediatriya",
    name: "Pediatriya",
    description: "Uşaq xəstəlikləri və peyvənd",
    icon: Baby,
    color: "from-teal-300 to-emerald-400",
  },
  {
    id: "ortopediya",
    name: "Ortopediya",
    description: "Sümük və oynaq xəstəliklərinin müalicəsi",
    icon: Bone,
    color: "from-teal-900 to-teal-700",
  },
  {
    id: "oftalmologiya",
    name: "Oftalmologiya",
    description: "Göz xəstəliklərinin diaqnostikası və müalicəsi",
    icon: Eye,
    color: "from-teal-500 to-teal-700",
  },
  {
    id: "laboratoriya",
    name: "Laboratoriya",
    description: "Klinik laboratoriya analizləri",
    icon: Syringe,
    color: "from-teal-700 to-teal-900",
  },
  {
    id: "checkup",
    name: "Check-up",
    description: "Kompleks müayinə paketləri",
    icon: Activity,
    color: "from-teal-500 to-teal-300",
  },
]

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Əli Hüseynov",
    specialty: "Kardioloq",
    department: "kardiologiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 15,
    rating: 4.9,
    available: true,
    languages: ["Azərbaycanca", "Rusca", "İngiliscə"],
    education: "Bakı Dövlət Tibb Universiteti",
  },
  {
    id: "2",
    name: "Dr. Leyla Əhmədova",
    specialty: "Nevropatoloq",
    department: "nevrologiya",
    branchId: "qarayev",
    branch: "Qarayev",
    experience: 12,
    rating: 4.8,
    available: true,
    languages: ["Azərbaycanca", "Rusca"],
    education: "Azərbaycan Tibb Universiteti",
  },
  {
    id: "3",
    name: "Dr. Murad Əliyev",
    specialty: "Terapevt",
    department: "terapiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 10,
    rating: 4.7,
    available: true,
    languages: ["Azərbaycanca", "İngiliscə"],
    education: "Bakı Dövlət Tibb Universiteti",
  },
  {
    id: "4",
    name: "Dr. Günel Məmmədova",
    specialty: "Pediatr",
    department: "pediatriya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 8,
    rating: 4.9,
    available: false,
    languages: ["Azərbaycanca", "Rusca"],
    education: "Azərbaycan Tibb Universiteti",
  },
  {
    id: "5",
    name: "Dr. Rəşad Quliyev",
    specialty: "Ortoped",
    department: "ortopediya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 18,
    rating: 4.8,
    available: true,
    languages: ["Azərbaycanca", "Rusca", "İngiliscə"],
    education: "Bakı Dövlət Tibb Universiteti",
  },
  {
    id: "6",
    name: "Dr. Aynur Kərimova",
    specialty: "Oftalmoloq",
    department: "oftalmologiya",
    branchId: "qarayev",
    branch: "Qarayev",
    experience: 14,
    rating: 4.9,
    available: true,
    languages: ["Azərbaycanca", "Rusca"],
    education: "Azərbaycan Tibb Universiteti",
  },
]

export const branches: Branch[] = [
  {
    id: "nrimanov",
    name: "Nərimanov Filialı",
    address: "Bakı ş., Nərimanov r., Ü.Hacıbəyli küç. 42",
    phone: "+994 55 710 10 50",
    workingHours: "B.e - Cümə: 08:00 - 20:00",
    mapUrl: "https://maps.google.com/?q=Memorial+Hospital+Nərimanov",
  },
  {
    id: "qarayev",
    name: "Qarayev Filialı",
    address: "Bakı ş., Qarayev r., Ü.Hüseyn Cavid küç. 28",
    phone: "+994 55 710 10 51",
    workingHours: "B.e - Cümə: 08:00 - 20:00",
    mapUrl: "https://maps.google.com/?q=Memorial+Hospital+Qarayev",
  },
  {
    id: "ganca",
    name: "Gəncə Filialı",
    address: "Gəncə ş., Nizami r., Ü.Nizami küç. 120",
    phone: "+994 55 710 10 52",
    workingHours: "B.e - Cümə: 08:00 - 18:00",
    mapUrl: "https://maps.google.com/?q=Memorial+Hospital+Gəncə",
  },
]

export const services: Service[] = [
  {
    id: "1",
    name: "Kompleks Müayinə",
    description: "Tam sağlamlıq yoxlaması - 40+ göstərici",
    price: "150 AZN",
    duration: "2-3 saat",
    icon: Activity,
  },
  {
    id: "2",
    name: "Kardioloji Müayinə",
    description: "Ürək diaqnostikası - EKG, EXO, analizlər",
    price: "80 AZN",
    duration: "45 dəq",
    icon: Heart,
  },
  {
    id: "3",
    name: "Laboratoriya Analizi",
    description: "Qan, sidik və digər laboratoriya testləri",
    price: "5 AZN-dən",
    duration: "1-2 saat",
    icon: Syringe,
  },
  {
    id: "4",
    name: "Uşaq Müayinəsi",
    description: "Pediatrik müayinə və peyvənd",
    price: "40 AZN",
    duration: "30 dəq",
    icon: Baby,
  },
]

/** Year the hospital opened. Keep YEARS_OF_EXPERIENCE in sync with it. */
export const FOUNDED_YEAR = 2009
/**
 * Hardcoded rather than derived from `new Date()` so that statically rendered
 * markup can never disagree with what the client computes (hydration mismatch).
 */
export const YEARS_OF_EXPERIENCE = 17

export const stats = [
  { label: "Təcrübəli Həkim", value: "50+", icon: Users },
  { label: "İllik Təcrübə", value: `${YEARS_OF_EXPERIENCE}+`, icon: Shield },
  { label: "Müalicə Olunan", value: "100K+", icon: Heart },
  { label: "Filial Sayı", value: "3", icon: MapPin },
]

export const contactInfo = {
  phone: "+994 55 710 10 50",
  email: "info@memorialhospital.az",
  workingHours: "B.e - Cümə: 08:00 - 20:00, Şənbə: 09:00 - 17:00",
  address: "Bakı ş., Nərimanov r., Ü.Hacıbəyli küç. 42",
}

/**
 * `tel:` URIs must not contain spaces — `tel:+994 55 710 10 50` is malformed and
 * some dialers drop everything after the first space.
 */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`

/** Branch id -> branch, for O(1) lookups in render paths. */
const branchById = new Map(branches.map((b) => [b.id, b]))
const departmentById = new Map(departments.map((d) => [d.id, d]))
const doctorById = new Map(doctors.map((d) => [d.id, d]))

export const getBranch = (id: string | undefined) =>
  id ? branchById.get(id) : undefined
export const getDepartment = (id: string | undefined) =>
  id ? departmentById.get(id) : undefined
export const getDoctor = (id: string | undefined) =>
  id ? doctorById.get(id) : undefined

export const getBranchName = (id: string | undefined) => getBranch(id)?.name ?? id ?? "-"
export const getDepartmentName = (id: string | undefined) =>
  getDepartment(id)?.name ?? id ?? "-"
export const getDoctorName = (id: string | undefined) => getDoctor(id)?.name ?? id ?? "-"

/**
 * Every branch id referenced by a doctor must exist in `branches`. A mismatch
 * here silently empties the doctor picker on the booking form, so we fail loudly
 * in development instead.
 */
if (process.env.NODE_ENV !== "production") {
  for (const doctor of doctors) {
    if (!branchById.has(doctor.branchId)) {
      throw new Error(
        `Doctor "${doctor.name}" references unknown branchId "${doctor.branchId}"`
      )
    }
    if (!departmentById.has(doctor.department)) {
      throw new Error(
        `Doctor "${doctor.name}" references unknown department "${doctor.department}"`
      )
    }
  }
}
