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
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { contactInfo, telHref } from "@/data"
import { useAuthStore } from "@/lib/auth-store"
import { useCurrentUser } from "@/lib/use-current-user"
import { signOut } from "next-auth/react"
import { smoothScrollToElement } from "@/lib/smooth-scroll"

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

  const pathname = usePathname()
  const router = useRouter()

  // Covers both login methods — Google session or local email/password account.
  const { user } = useCurrentUser()
  const localLogout = useAuthStore((s) => s.logout)

  const handleLogout = useCallback(() => {
    localLogout()
    if (user?.source === "google") {
      // Clears the httpOnly session cookie server-side; a client-only reset
      // would leave the visitor still signed in on the next request.
      void signOut({ callbackUrl: "/" })
    } else {
      router.push("/")
    }
  }, [localLogout, user?.source, router])


  const scrollToSection = useCallback((href: string) => {
    const el = document.getElementById(href.replace("#", ""))
    if (!el) return
    // Animated frame-by-frame rather than via `behavior: "smooth"`, which the
    // browser turns into an instant jump when scroll-behavior is forced to auto.
    smoothScrollToElement(el)
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
    // 20px triggered almost immediately, which read as a flicker rather than a
    // transition. Past the hero's first slice the change has somewhere to go.
    const handleScroll = () => setScrolled(window.scrollY > 90)
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

  /*
   * On the home page the header sits over the hero photograph rather than
   * above it, so until the visitor scrolls it is transparent and its contents
   * are drawn in white. Everywhere else, and once scrolled, it is the normal
   * solid bar — a transparent header over white page content would be invisible.
   */
  const overHero = pathname === "/" && !scrolled

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
        "site-header sticky top-0 z-50 w-full transition-[background-color,box-shadow,border-color] duration-700 ease-out",
        overHero
          ? "bg-transparent"
          : scrolled
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
              className={cn(
                "h-8 md:h-10 w-auto transition-[filter] duration-700 ease-out",
                // The mark is dark artwork; inverting it is cheaper and stays
                // in sync than shipping a second white file.
                overHero && "brightness-0 invert"
              )}
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Əsas menyu">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-700 ease-out relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:rounded-full after:transition-all after:duration-300 hover:after:w-3/4 cursor-pointer",
                  overHero
                    ? "text-white hover:bg-white/10 after:bg-white"
                    : "text-slate-700 hover:text-teal-700 hover:bg-teal-50 after:bg-teal-600"
                )}
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
            <Button
              variant="outline"
              size="sm"
              className={cn(
                overHero && "border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              )}
              asChild
            >
              <Link href="/neticeler">
                <FileText className="w-4 h-4" aria-hidden="true" />
                Nəticələrimə bax
              </Link>
            </Button>
            <Button variant="cta" size="sm" asChild>
              <Link href="/qebul">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                Qəbula Yazıl
              </Link>
            </Button>

            {/*
              "Daxil Ol" is the default, not a loading placeholder.

              `useSession()` stays in `status: "loading"` until /api/auth/session
              answers, which on a cold serverless function can take seconds —
              and this used to render an empty box for that whole window, so the
              button appeared to be missing. Logged out is both the far more
              common case and what the server rendered, so show it immediately
              and swap to the account menu only once a user is actually known.
            */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((open) => !open)}
                  aria-expanded={showUserMenu}
                  aria-haspopup="menu"
                  aria-label={`Hesab menyusu — ${user.fullName}`}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors",
                    overHero ? "hover:bg-white/10" : "hover:bg-slate-50"
                  )}
                >
                  <span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </span>
                  <ChevronDown
                    className={cn("w-4 h-4", overHero ? "text-white" : "text-slate-500")}
                    aria-hidden="true"
                  />
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
                        setShowUserMenu(false)
                        handleLogout()
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
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  overHero &&
                    "border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                )}
                asChild
              >
                <Link href="/giris">
                  <User className="w-4 h-4" aria-hidden="true" />
                  Daxil Ol
                </Link>
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "lg:hidden transition-transform duration-300 active:scale-90",
              overHero && "text-white hover:bg-white/10 hover:text-white"
            )}
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
              {user ? (
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
                      setIsOpen(false)
                      handleLogout()
                    }}
                    className="px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Çıxış
                  </button>
                </>
              ) : (
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
              )}
              <Button variant="emergency" size="sm" className="w-full" asChild>
                <a href={telHref(contactInfo.phone)}>
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  Təcili Zəng
                </a>
              </Button>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/neticeler" onClick={() => setIsOpen(false)}>
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  Nəticələrimə bax
                </Link>
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
