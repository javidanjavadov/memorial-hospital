import {
  Activity,
  Baby,
  Bone,
  Brain,
  Droplets,
  Eye,
  FlaskConical,
  Heart,
  HeartPulse,
  MapPin,
  Microscope,
  Pill,
  Scan,
  Shield,
  Smile,
  Stethoscope,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"

/*
 * Doctors, specialties, branches and prices below are the hospital's real
 * published data. Nothing here is invented: credentials and consultation fees
 * are factual claims about named medical professionals, and guessing at them
 * would mislead patients choosing who to see.
 */

export interface Doctor {
  id: string
  name: string
  /** Real published specialty. */
  specialty: string
  /** Honorific or full title, where the hospital publishes one. */
  title: string | null
  department: string
  /** Canonical branch id — must match a `Branch.id`. Used for all filtering. */
  branchId: string
  /** Short display name of the branch. Never compare against this. */
  branch: string
  experience: number
  /** Consultation fee in AZN. `null` for laboratory and imaging staff, who do
   *  not take direct bookings. */
  price: number | null
  image: string
  available: boolean
}

export interface Department {
  id: string
  name: string
  description: string
  icon: LucideIcon
}

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  workingHours: string
  latitude: string
  longitude: string
  mapUrl: string
}

export interface ServiceCategory {
  id: string
  name: string
  description: string
  image: string
  href: string
}

export const departments: Department[] = [
  { id: "terapiya", name: "Terapiya", description: "Ümumi terapevtik müayinə və müalicə", icon: Stethoscope },
  { id: "kardiologiya", name: "Kardiologiya", description: "Ürək və damar xəstəliklərinin diaqnostikası", icon: Heart },
  { id: "nevrologiya", name: "Nevrologiya", description: "Sinir sistemi xəstəliklərinin müalicəsi", icon: Brain },
  { id: "neyrocerrahiyye", name: "Neyrocərrahiyyə", description: "Beyin və onurğa beyni cərrahiyyəsi", icon: Zap },
  { id: "pediatriya", name: "Pediatriya", description: "Uşaq sağlamlığı və inkişafın izlənməsi", icon: Baby },
  { id: "ginekologiya", name: "Ginekologiya", description: "Mama-ginekologiya və qadın sağlamlığı", icon: HeartPulse },
  { id: "endokrinologiya", name: "Endokrinologiya", description: "Hormonal pozğunluqlar və metabolizm", icon: Activity },
  { id: "qastroenterologiya", name: "Qastroenterologiya", description: "Həzm sistemi xəstəliklərinin müalicəsi", icon: Pill },
  { id: "oftalmologiya", name: "Oftalmologiya", description: "Göz xəstəlikləri və görmə korreksiyası", icon: Eye },
  { id: "travmatologiya", name: "Travmatologiya", description: "Sümük, oynaq və əzələ zədələnmələri", icon: Bone },
  { id: "urologiya", name: "Urologiya", description: "Sidik-cinsiyyət sistemi və androlojiya", icon: Droplets },
  { id: "stomatologiya", name: "Stomatologiya", description: "Diş müalicəsi və ağız sağlamlığı", icon: Smile },
  { id: "radiologiya", name: "Radiologiya", description: "Şüa diaqnostikası — USM, rentgen, KT", icon: Scan },
  { id: "laboratoriya", name: "Laboratoriya", description: "Klinik, biokimyəvi və genetik analizlər", icon: FlaskConical },
  { id: "algologiya", name: "Algologiya", description: "Ağrı sindromlarının diaqnostikası və müalicəsi", icon: Microscope },
]

export const doctors: Doctor[] = [
  {
    id: "tofiq-sixaliyev",
    name: "Tofiq Şıxəliyev",
    specialty: "Terapevt",
    title: null,
    department: "terapiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 50,
    price: 35,
    image: "/doctors/tofiq-sixaliyev.webp",
    available: true,
  },
  {
    id: "azira-aliyeva",
    name: "Azirə Əliyeva",
    specialty: "Ginekoloq",
    title: "Respublikanın Əməkdar Həkimi — I dərəcəli həkim mama-ginekoloq",
    department: "ginekologiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 49,
    price: 50,
    image: "/doctors/azira-aliyeva.webp",
    available: true,
  },
  {
    id: "karamat-hasanov",
    name: "Kəramət Həsənov",
    specialty: "Stomatoloq",
    title: null,
    department: "stomatologiya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 20,
    image: "/doctors/karamat-hasanov.webp",
    available: true,
  },
  {
    id: "ilqar-agamaliyev",
    name: "İlqar Ağamalıyev",
    specialty: "Nevropatoloq",
    title: null,
    department: "nevrologiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 50,
    price: 40,
    image: "/doctors/ilqar-agamaliyev.webp",
    available: true,
  },
  {
    id: "narmin-aliyeva",
    name: "Nərmin Əliyeva",
    specialty: "Kardioloq",
    title: null,
    department: "kardiologiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 17,
    price: 50,
    image: "/doctors/narmin-aliyeva.webp",
    available: true,
  },
  {
    id: "aisa-karimova",
    name: "Aişə Kərimova",
    specialty: "Terapevt",
    title: null,
    department: "terapiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 4,
    price: 50,
    image: "/doctors/aisa-karimova.webp",
    available: true,
  },
  {
    id: "yunis-hasanov",
    name: "Yunis Həsənov",
    specialty: "Ürək damar cərrahı",
    title: null,
    department: "kardiologiya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 50,
    image: "/doctors/yunis-hasanov.webp",
    available: true,
  },
  {
    id: "qaya-dosiyev",
    name: "Qaya Dosiyev",
    specialty: "Terapevt",
    title: null,
    department: "terapiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 12,
    price: 50,
    image: "/doctors/qaya-dosiyev.webp",
    available: true,
  },
  {
    id: "elvin-malikov",
    name: "Elvin Məlikov",
    specialty: "Nevropatoloq",
    title: null,
    department: "nevrologiya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 40,
    image: "/doctors/elvin-malikov.webp",
    available: true,
  },
  {
    id: "rasad-xamedov",
    name: "Rəşad Xamedov",
    specialty: "Qastroenteroloq",
    title: null,
    department: "qastroenterologiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 20,
    price: 50,
    image: "/doctors/rasad-xamedov.webp",
    available: true,
  },
  {
    id: "inayat-haciyev",
    name: "İnayət Hacıyev",
    specialty: "Oftalmoloq",
    title: null,
    department: "oftalmologiya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 50,
    image: "/doctors/inayat-haciyev.webp",
    available: true,
  },
  {
    id: "kamala-babirova",
    name: "Kəmalə Bəbirova",
    specialty: "Həkim-radioloq",
    title: null,
    department: "radiologiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 20,
    price: null,
    image: "/doctors/kamala-babirova.webp",
    available: true,
  },
  {
    id: "aygun-quliyeva",
    name: "Aygün Quliyeva",
    specialty: "Həkim-radioloq",
    title: null,
    department: "radiologiya",
    branchId: "qarayev",
    branch: "Qarayev",
    experience: 22,
    price: null,
    image: "/doctors/aygun-quliyeva.webp",
    available: true,
  },
  {
    id: "sabina-ibrahimova",
    name: "Səbinə İbrahimova",
    specialty: "Endokrinoloq",
    title: null,
    department: "endokrinologiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 14,
    price: 60,
    image: "/doctors/sabina-ibrahimova.webp",
    available: true,
  },
  {
    id: "parviz-hasizada",
    name: "Pərviz Həsizadə",
    specialty: "Neyrocərrah",
    title: null,
    department: "neyrocerrahiyye",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 30,
    image: "/doctors/parviz-hasizada.webp",
    available: true,
  },
  {
    id: "tural-tanriverdizada",
    name: "Tural Tanrıverdizadə",
    specialty: "Nevropatoloq",
    title: null,
    department: "nevrologiya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 50,
    image: "/doctors/tural-tanriverdizada.webp",
    available: true,
  },
  {
    id: "vuqar-mirzaliyev",
    name: "Vüqar Mirzəliyev",
    specialty: "Neyrocərrah",
    title: null,
    department: "neyrocerrahiyye",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 50,
    image: "/doctors/vuqar-mirzaliyev.webp",
    available: true,
  },
  {
    id: "isa-sirinov",
    name: "İsa Şirinov",
    specialty: "Travmatoloq",
    title: null,
    department: "travmatologiya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 50,
    image: "/doctors/isa-sirinov.webp",
    available: true,
  },
  {
    id: "vafa-mammadova",
    name: "Vəfa Məmmədova",
    specialty: "Metabolizm laboratoriyası rəhbəri",
    title: null,
    department: "laboratoriya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 10,
    price: null,
    image: "/doctors/vafa-mammadova.webp",
    available: true,
  },
  {
    id: "elvira-verdiyeva",
    name: "Elvira Verdiyeva",
    specialty: "Stomatoloq",
    title: null,
    department: "stomatologiya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 50,
    image: "/doctors/elvira-verdiyeva.webp",
    available: true,
  },
  {
    id: "ilqar-alizada",
    name: "İlqar Əlizadə",
    specialty: "Kardioloq",
    title: null,
    department: "kardiologiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 10,
    price: 50,
    image: "/doctors/ilqar-alizada.webp",
    available: true,
  },
  {
    id: "faxraddin-mastaliyev",
    name: "Fəxrəddin Məstəliyev",
    specialty: "Nevropatoloq",
    title: null,
    department: "nevrologiya",
    branchId: "qarayev",
    branch: "Qarayev",
    experience: 30,
    price: 30,
    image: "/doctors/faxraddin-mastaliyev.webp",
    available: true,
  },
  {
    id: "asif-sarifov",
    name: "Asif Şərifov",
    specialty: "Alqoloq",
    title: null,
    department: "algologiya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 50,
    image: "/doctors/asif-sarifov.webp",
    available: true,
  },
  {
    id: "nigar-qarayeva",
    name: "Nigar Qarayeva",
    specialty: "Kardioloq",
    title: null,
    department: "kardiologiya",
    branchId: "nrimanov",
    branch: "Nərimanov",
    experience: 10,
    price: 50,
    image: "/doctors/nigar-qarayeva.webp",
    available: true,
  },
  {
    id: "afqan-alixanov",
    name: "Əfqan Əlixanov",
    specialty: "Həkim-patohistoloq",
    title: null,
    department: "laboratoriya",
    branchId: "qarayev",
    branch: "Qarayev",
    experience: 20,
    price: null,
    image: "/doctors/afqan-alixanov.webp",
    available: true,
  },
  {
    id: "namiq-isgandarov",
    name: "Namiq İsgəndərov",
    specialty: "Klinik-biokimyəvi laboratoriya rəhbəri",
    title: null,
    department: "laboratoriya",
    branchId: "qarayev",
    branch: "Qarayev",
    experience: 25,
    price: null,
    image: "/doctors/namiq-isgandarov.webp",
    available: true,
  },
  {
    id: "maryam-qarahmadova",
    name: "Məryəm Qarəhmədova",
    specialty: "Genetik laboratoriya rəhbəri",
    title: null,
    department: "laboratoriya",
    branchId: "qarayev",
    branch: "Qarayev",
    experience: 15,
    price: null,
    image: "/doctors/maryam-qarahmadova.webp",
    available: true,
  },
  {
    id: "cicak-maharramova",
    name: "Çiçək Məhərrəmova",
    specialty: "Endokrinoloq",
    title: null,
    department: "endokrinologiya",
    branchId: "qarayev",
    branch: "Qarayev",
    experience: 15,
    price: 40,
    image: "/doctors/cicak-maharramova.webp",
    available: true,
  },
  {
    id: "anar-mammadov",
    name: "Anar Məmmədov",
    specialty: "Uroloq-androloq",
    title: null,
    department: "urologiya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 50,
    image: "/doctors/anar-mammadov.webp",
    available: true,
  },
  {
    id: "anar-isayev",
    name: "Anar İsayev",
    specialty: "Həkim-patohistoloq",
    title: null,
    department: "laboratoriya",
    branchId: "qarayev",
    branch: "Qarayev",
    experience: 20,
    price: null,
    image: "/doctors/anar-isayev.webp",
    available: true,
  },
  {
    id: "asif-mammadov",
    name: "Asif Məmmədov",
    specialty: "Pediatr",
    title: null,
    department: "pediatriya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 20,
    image: "/doctors/asif-mammadov.webp",
    available: true,
  },
  {
    id: "mazahir-mammadov",
    name: "Məzahir Məmmədov",
    specialty: "Travmatoloq",
    title: null,
    department: "travmatologiya",
    branchId: "ganca",
    branch: "Gəncə",
    experience: 20,
    price: 40,
    image: "/doctors/mazahir-mammadov.webp",
    available: true,
  },
  {
    id: "kanan-yediyarov",
    name: "Kənan Yediyarov",
    specialty: "Uroloq-androloq",
    title: null,
    department: "urologiya",
    branchId: "qarayev",
    branch: "Qarayev",
    experience: 15,
    price: 40,
    image: "/doctors/kanan-yediyarov.webp",
    available: true,
  },
]

export const branches: Branch[] = [
  {
    id: "nrimanov",
    name: "Nərimanov filialı",
    address: "Zaur Nudirəliyev 79 (7 saylı ASAN xidmətlə üzbəüz)",
    phone: "+994 12 210 10 50",
    workingHours: "B.e – Şənbə: 08:30 – 18:00 · Bazar: İstirahət",
    latitude: "40.41279965747473",
    longitude: "49.8561555147171",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=40.41279965747473,49.8561555147171",
  },
  {
    id: "qarayev",
    name: "Qarayev filialı",
    address: "Q.Qarayev pr. 38A",
    phone: "+994 12 210 10 50",
    workingHours: "B.e – Şənbə: 07:30 – 18:00 · Bazar: 08:30 – 15:00",
    latitude: "40.416013",
    longitude: "49.9383156",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=40.416013,49.9383156",
  },
  {
    id: "ganca",
    name: "Gəncə Memorial Hospital",
    address: "Gəncə şəhəri, Şah İsmayıl Xətai pr. 550A",
    phone: "+994 22 428 97 97",
    workingHours: "Həftənin 7 günü — 24 saat",
    latitude: "40.68347955442481",
    longitude: "46.38560235500336",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=40.68347955442481,46.38560235500336",
  },
]

/** Top-level service categories, mirroring how the hospital groups them. */
export const serviceCategories: ServiceCategory[] = [
  { id: "laboratoriya", name: "Laboratoriya", description: "Klinik, biokimyəvi, hormonal və genetik analizlər", image: "/services/laboratoriya.svg", href: "/xidmetler#laboratoriya" },
  { id: "poliklinika", name: "Poliklinika", description: "Ambulator müayinə, diaqnostika və müşahidə", image: "/services/poliklinika.svg", href: "/xidmetler#poliklinika" },
  { id: "hekim-qebulu", name: "Həkim qəbulu", description: "33 həkim, 15 ixtisas üzrə onlayn qəbul", image: "/services/hekim-qebulu.svg", href: "/hekimler" },
  { id: "checkup", name: "Check-up müayinə", description: "Tam sağlamlıq yoxlaması — check-up paketləri", image: "/services/checkup.svg", href: "/xidmetler#checkup" },
  { id: "evde-xidmet", name: "Evdə xidmət", description: "Qan götürmə və müayinə üçün evinizə gəlirik", image: "", href: "/xidmetler#evde-xidmet" },
]

/** Contact details, matching the hospital's published numbers. */
export const contactInfo = {
  phone: "+994 12 210 10 50",
  mobile: "+994 55 410 10 50",
  whatsapp: "+994 55 710 10 50",
  ganja: "+994 22 428 97 97",
  email: "info@memorialhospital.az",
  workingHours: "B.e – Şənbə: 08:30 – 18:00",
  address: "Zaur Nudirəliyev 79, Nərimanov r., Bakı",
}

/** Year the hospital opened. Keep YEARS_OF_EXPERIENCE in sync with it. */
export const FOUNDED_YEAR = 2009
/**
 * Hardcoded rather than derived from `new Date()` so statically rendered markup
 * can never disagree with what the client computes (hydration mismatch).
 */
export const YEARS_OF_EXPERIENCE = 17

export const stats = [
  { label: "Həkim", value: `${doctors.length}`, icon: Users },
  { label: "İxtisas", value: `${departments.length}`, icon: Stethoscope },
  { label: "Filial", value: `${branches.length}`, icon: MapPin },
  { label: "İllik təcrübə", value: `${YEARS_OF_EXPERIENCE}+`, icon: Shield },
]

/**
 * `tel:` URIs must not contain spaces — `tel:+994 12 210 10 50` is malformed
 * and some dialers drop everything after the first space.
 */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`

/** Lookup maps, so render paths stay O(1). */
const branchById = new Map(branches.map((b) => [b.id, b]))
const departmentById = new Map(departments.map((d) => [d.id, d]))
const doctorById = new Map(doctors.map((d) => [d.id, d]))

export const getBranch = (id: string | undefined) => (id ? branchById.get(id) : undefined)
export const getDepartment = (id: string | undefined) =>
  id ? departmentById.get(id) : undefined
export const getDoctor = (id: string | undefined) => (id ? doctorById.get(id) : undefined)

export const getBranchName = (id: string | undefined) => getBranch(id)?.name ?? id ?? "-"
export const getDepartmentName = (id: string | undefined) =>
  getDepartment(id)?.name ?? id ?? "-"
export const getDoctorName = (id: string | undefined) => getDoctor(id)?.name ?? id ?? "-"

/** Doctors grouped by department, for the departments listing. */
export const doctorsByDepartment = (departmentId: string) =>
  doctors.filter((d) => d.department === departmentId)

/**
 * Every branch and department id referenced by a doctor must exist. A mismatch
 * silently empties the doctor picker on the booking form, so fail loudly in
 * development rather than shipping an empty list.
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

export interface Faq {
  question: string
  answer: string
}

/**
 * Verbatim from the hospital public API rather than rewritten: these are the
 * answers the call centre already gives, so the site must not contradict them.
 */
export const faqs: Faq[] = [
  {
    question: "Online nəticələr necə əldə edilir?",
    answer:
      "Analiz verməzdən əvvəl resepsionda şəxsi məlumatlarınız qeyd olunur. Cavab hazır olduqda, mobil telefonunuza SMS bildirişi göndərilir. Əlavə olaraq, nəticələr qeyd etdiyiniz e-poçt ünvanına və ya həkiminizin e-poçt ünvanına göndərilir.",
  },
  {
    question: "Bir testin bir neçə metodla təyini mümkündürsə, hansını seçməliyəm?",
    answer:
      "Testlərin hər biri haqqında saytımızın təsvir bölməsində ətraflı məlumat verilmişdir. Hər metodun üstünlükləri və məhdudiyyətləri ayrıca qeyd olunub. Bu məlumatlara əsaslanaraq, diaqnostika məqsədinizə ən uyğun olan üsulu seçə bilərsiniz. Əgər seçimdə çətinlik çəkirsinizsə, həkiminiz və ya laboratoriya mütəxəssislərimiz sizə istiqam't verə bilər.",
  },
  {
    question: "Həkim qəbuluna necə yazılım?",
    answer:
      "Bu xidmət yaxın zamanda istifadənizə təqdim ediləcək. Əlavə məlumat üçün bizi izləməyə davam edin və ya əlaqə bölməsindən bizimlə əlaqə saxlayın",
  },
  {
    question: "XXX analizini vermək istəyirəm. Analizə acqarına gəlməliyəm? Ödənişi nə qədərdir?",
    answer:
      "İstədiyiniz analizi saytın “axtarış” bölməsindən və ya aid olduğu kateqoriyadan seçə bilərsiniz. Analizin qiyməti  həmin səhifədə qeyd olunub. “Analizə hazırlıq” bölməsində isə testin acqarına və ya digər şərtlərlə verilib-verilməməsi barədə ətraflı məlumat təqdim edilir.",
  },
  {
    question: "Onlayn qeydiyyatdan necə keçə bilərəm?",
    answer:
      "Onlayn qeydiyyat üçün memorialhospital.az saytına daxil olun və “Qeydiyyat” bölməsindən qeydiyyat prosesini başlayın. Şəxsi məlumatlarınızı daxil edərək həm özünüz, həm də ailə üzvləriniz üçün qeydiyyat apara bilərsiniz. Daha sonra “Laborator analizlər” bölməsindən istədiyiniz testləri seçərək səbətə əlavə edin. Ödənişi onlayn şəkildə kartla və ya klinikada yerində ödəmə yolu ilə həyata keçirə bilərsiniz.",
  },
  {
    question: "Klinikaya gəlmədən evdə analiz verə bilərəmmi?",
    answer:
      "Bəli, evdə analiz götürülməsi xidmətimiz mövcuddur. Bunun üçün çağrı mərkəzimizə zəng edərək operatorlara ünvanınızı və digər zəruri məlumatları təqdim etməyiniz kifayətdir. Ən qısa zamanda tibbi briqadamız evinizə və ya ofisinizə göndərilir və analizlər peşəkar şəkildə götürülür.",
  },
  {
    question: "Şirkətimizin işçilərini davamlı olaraq check-up-lardan keçirmək istəyirik. Güzəştlər varmı? Müayinə və analizləri klinikaya gəlmədən yerindəcə aparmaq mümkündürmü?",
    answer:
      "Bəli, korporativ müştərilər üçün xüsusi endirimli check-up paketlərimiz mövcuddur. Eyni zamanda, ehtiyac olduğu halda tibbi briqadamız əməkdaşlarınızın olduğu ünvana – ofisə və ya digər iş yerlərinə göndərilərək, müvafiq müayinə və analizləri yerindəcə həyata keçirə bilir. Ətraflı məlumat və əməkdaşlıq üçün bizimlə birbaşa əlaqə saxlaya bilərsiniz.",
  },
]
