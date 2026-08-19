"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  Phone,
  User,
  LogOut,
  Calendar,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { contactInfo, telHref } from "@/data"
import { useAuthStore } from "@/lib/auth-store"

const navItems = [
  { label: "Ana Səhifə", href: "#hero" },
  { label: "Haqqımızda", href: "#haqqimizda" },
  { label: "Həkimlər", href: "#hekimler" },
  { label: "Xidmətlər", href: "#xidmetler" },
  { label: "Filiallar", href: "#filiallar" },
  { label: "Əlaqə", href: "#elaqe" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const user = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  const logout = useAuthStore((s) => s.logout)

  const pathname = usePathname()
  const router = useRouter()

  const scrollToSection = useCallback((href: string) => {
    const el = document.getElementById(href.replace("#", ""))
    if (!el) return
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const top = el.getBoundingClientRect().top + window.scrollY - 100
    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    })
  }, [])

  const handleNavClick = useCallback(
    (href: string) => {
      setIsOpen(false)
      if (pathname === "/") {
        scrollToSection(href)
      } else {
        // `router.push` keeps client-side routing (and the page transition)
        // intact; `window.location.href` forced a full document reload.
        router.push(`/${href}`)
      }
    },
    [pathname, router, scrollToSection]
  )

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close the account menu on outside click or Escape.
  useEffect(() => {
    if (!showUserMenu) return

    const onPointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowUserMenu(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [showUserMenu])

  const initials = user
    ? user.fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : ""

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-teal-100"
          : "bg-white"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="flex items-center group transition-transform duration-300 hover:scale-105"
          >
            <Image
              src="/logo.svg"
              alt="Memorial Hospital — ana səhifə"
              width={144}
              height={50}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Əsas menyu">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all duration-200 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-teal-600 after:rounded-full after:transition-all after:duration-300 hover:after:w-3/4 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="emergency" size="sm" asChild>
              <a href={telHref(contactInfo.phone)}>
                <Phone className="w-4 h-4" aria-hidden="true" />
                Təcili Zəng
              </a>
            </Button>
            <Button variant="cta" size="sm" asChild>
              <Link href="/qebul">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                Qəbula Yazıl
              </Link>
            </Button>

            {/* Rendered only after the persisted store has loaded, so the
                server markup and the first client render always agree. */}
            {!hasHydrated ? (
              <div className="w-[88px] h-9" aria-hidden="true" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((open) => !open)}
                  aria-expanded={showUserMenu}
                  aria-haspopup="menu"
                  aria-label={`Hesab menyusu — ${user.fullName}`}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />
                </button>
                {showUserMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border z-50 overflow-hidden animate-fade-in-down"
                  >
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-slate-900">
                        {user.fullName}
                      </p>
                    </div>
                    <Link
                      href="/profil"
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" aria-hidden="true" />
                      Profilim
                    </Link>
                    <hr className="border-slate-100" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                        router.push("/")
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Çıxış
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/giris"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all duration-200"
              >
                Daxil Ol
              </Link>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden transition-transform duration-300 active:scale-90"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Menyunu bağla" : "Menyunu aç"}
          >
            <span className="relative w-6 h-6 block" aria-hidden="true">
              <Menu
                className={cn(
                  "w-6 h-6 absolute transition-all duration-300",
                  isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                )}
              />
              <X
                className={cn(
                  "w-6 h-6 absolute transition-all duration-300",
                  isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                )}
              />
            </span>
          </Button>
        </div>
      </div>

      {/*
        `hidden` (not just max-h-0) once collapsed: an invisible-but-present menu
        keeps its links focusable and readable by screen readers.
      */}
      <div
        id="mobile-menu"
        hidden={!isOpen}
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-4 bg-white border-t border-teal-100">
          <nav className="flex flex-col gap-2" aria-label="Mobil menyu">
            {navItems.map((item, i) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all duration-200 hover:translate-x-1 text-left cursor-pointer"
                style={{ transitionDelay: isOpen ? `${i * 50}ms` : "0ms" }}
              >
                {item.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
              {hasHydrated && user ? (
                <>
                  <Link
                    href="/profil"
                    className="px-4 py-3 text-sm font-medium text-teal-700 rounded-lg bg-teal-50 flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <span
                      className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      aria-hidden="true"
                    >
                      {initials}
                    </span>
                    {user.fullName}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                      router.push("/")
                    }}
                    className="px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Çıxış
                  </button>
                </>
              ) : hasHydrated ? (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/giris" onClick={() => setIsOpen(false)}>
                      <User className="w-4 h-4" aria-hidden="true" />
                      Daxil Ol
                    </Link>
                  </Button>
                  <Button variant="cta" className="w-full" asChild>
                    <Link href="/qeydiyyat" onClick={() => setIsOpen(false)}>
                      Qeydiyyatdan Keç
                    </Link>
                  </Button>
                </>
              ) : null}
              <Button variant="emergency" size="sm" className="w-full" asChild>
                <a href={telHref(contactInfo.phone)}>
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  Təcili Zəng
                </a>
              </Button>
              <Button variant="cta" size="sm" className="w-full" asChild>
                <Link href="/qebul" onClick={() => setIsOpen(false)}>
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  Qəbula Yazıl
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
