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
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  type LucideIcon,
} from "lucide-react"

export interface Doctor {
  id: string
  name: string
  specialty: string
  department: string
  branch: string
  experience: number
  rating: number
  image: string
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
    branch: "Nərimanov",
    experience: 15,
    rating: 4.9,
    image: "/doctors/doctor-1.jpg",
    available: true,
    languages: ["Azərbaycanca", "Rusca", "İngiliscə"],
    education: "Bakı Dövlət Tibb Universiteti",
  },
  {
    id: "2",
    name: "Dr. Leyla Əhmədova",
    specialty: "Nevropatoloq",
    department: "nevrologiya",
    branch: "Qarayev",
    experience: 12,
    rating: 4.8,
    image: "/doctors/doctor-2.jpg",
    available: true,
    languages: ["Azərbaycanca", "Rusca"],
    education: "Azərbaycan Tibb Universiteti",
  },
  {
    id: "3",
    name: "Dr. Murad Əliyev",
    specialty: "Terapevt",
    department: "terapiya",
    branch: "Nərimanov",
    experience: 10,
    rating: 4.7,
    image: "/doctors/doctor-3.jpg",
    available: true,
    languages: ["Azərbaycanca", "İngiliscə"],
    education: "Bakı Dövlət Tibb Universiteti",
  },
  {
    id: "4",
    name: "Dr. Günel Məmmədova",
    specialty: "Pediatr",
    department: "pediatriya",
    branch: "Gəncə",
    experience: 8,
    rating: 4.9,
    image: "/doctors/doctor-4.jpg",
    available: false,
    languages: ["Azərbaycanca", "Rusca"],
    education: "Azərbaycan Tibb Universiteti",
  },
  {
    id: "5",
    name: "Dr. Rəşad Quliyev",
    specialty: "Ortoped",
    department: "ortopediya",
    branch: "Nərimanov",
    experience: 18,
    rating: 4.8,
    image: "/doctors/doctor-5.jpg",
    available: true,
    languages: ["Azərbaycanca", "Rusca", "İngiliscə"],
    education: "Bakı Dövlət Tibb Universiteti",
  },
  {
    id: "6",
    name: "Dr. Aynur Kərimova",
    specialty: "Oftalmoloq",
    department: "oftalmologiya",
    branch: "Qarayev",
    experience: 14,
    rating: 4.9,
    image: "/doctors/doctor-6.jpg",
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

export const stats = [
  { label: "Təcrübəli Həkim", value: "50+", icon: Users },
  { label: "İllik Təcrübə", value: "15+", icon: Shield },
  { label: "Müalicə Olunan", value: "100K+", icon: Heart },
  { label: "Filial Sayı", value: "3", icon: MapPin },
]

export const contactInfo = {
  phone: "+994 55 710 10 50",
  email: "info@memorialhospital.az",
  workingHours: "B.e - Cümə: 08:00 - 20:00, Şənbə: 09:00 - 17:00",
  address: "Bakı ş., Nərimanov r., Ü.Hacıbəyli küç. 42",
}
