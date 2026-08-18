"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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
import { contactInfo } from "@/data"
import { useAuthStore } from "@/lib/auth-store"

const navItems = [
  { label: "Ana Səhifə", href: "/" },
  { label: "Haqqımızda", href: "/haqqimizda" },
  { label: "Həkimlər", href: "/hekimler" },
  { label: "Xidmətlər", href: "/xidmetler" },
  { label: "Filiallar", href: "/filiallar" },
  { label: "Əlaqə", href: "/elaqe" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useAuthStore()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!showUserMenu) return
    const handleClickOutside = () => setShowUserMenu(false)
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [showUserMenu])

  return (
    <>
      {/* Main Navigation */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-teal-100"
            : "bg-white",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
        )}
        style={{ transitionDelay: mounted ? "100ms" : "0ms" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group transition-transform duration-300 hover:scale-105">
              <Image
                src="/logo.svg"
                alt="Memorial Hospital"
                width={144}
                height={50}
                className="h-8 md:h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all duration-200 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-teal-600 after:rounded-full after:transition-all after:duration-300 hover:after:w-3/4"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="emergency" size="sm" asChild>
                <a href={`tel:${contactInfo.phone}`}>
                  <Phone className="w-4 h-4" />
                  Təcili Zəng
                </a>
              </Button>
              <Button variant="cta" size="sm" asChild>
                <Link href="/qebul">
                  <Calendar className="w-4 h-4" />
                  Qəbula Yazıl
                </Link>
              </Button>
              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu) }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user.fullName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                  {showUserMenu && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border z-50 overflow-hidden animate-fade-in-down">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
                      </div>
                      <Link
                        href="/profil"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Profilim
                      </Link>
                      <hr className="border-slate-100" />
                      <button
                        onClick={() => { logout(); setShowUserMenu(false) }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden transition-transform duration-300 active:scale-90"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="relative w-6 h-6">
                <Menu className={cn("w-6 h-6 absolute transition-all duration-300", isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100")} />
                <X className={cn("w-6 h-6 absolute transition-all duration-300", isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0")} />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="container mx-auto px-4 py-4 bg-white border-t border-teal-100">
            <nav className="flex flex-col gap-2">
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all duration-200 hover:translate-x-1"
                  style={{ transitionDelay: isOpen ? `${i * 50}ms` : "0ms" }}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                {user ? (
                  <>
                    <Link
                      href="/profil"
                      className="px-4 py-3 text-sm font-medium text-teal-700 rounded-lg bg-teal-50 flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      {user.fullName}
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      className="px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıxış
                    </button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/giris" onClick={() => setIsOpen(false)}>
                        <User className="w-4 h-4" />
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
                  <a href={`tel:${contactInfo.phone}`}>
                    <Phone className="w-4 h-4" />
                    Təcili Zəng
                  </a>
                </Button>
                <Button variant="cta" size="sm" className="w-full" asChild>
                  <Link href="/qebul" onClick={() => setIsOpen(false)}>
                    <Calendar className="w-4 h-4" />
                    Qəbula Yazıl
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  )
}
