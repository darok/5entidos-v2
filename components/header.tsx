"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { PlusCircle, Settings, LogOut, Mic, Menu } from "lucide-react"

// Top navigation bar — scroll-aware: taller with larger logo at page top, compact on scroll
export function Header() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [menuOpen])

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      setScrolled(prev => {
        if (!prev && y > 80) return true
        if (prev && y < 30) return false
        return prev
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header
      className={`sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
        scrolled ? "h-16" : "h-32"
      }`}
    >
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <Link href="/" className="hover:opacity-80 transition-opacity relative">
          {/* Wrapper clips the full logo as header shrinks */}
          <div className={`transition-all duration-300 overflow-hidden ${scrolled ? "h-10" : "h-24"}`}>
            <Image
              src="/logo_full.png"
              alt="5entidos"
              width={200}
              height={200}
              className={`h-24 w-auto max-w-[96px] transition-opacity duration-300 ${scrolled ? "opacity-0" : "opacity-100"}`}
              priority
            />
          </div>
          {/* Compact: horizontal logo fades in on scroll */}
          <div className={`absolute inset-0 flex items-center transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <Image src="/logo_horiz.png" alt="5entidos" width={160} height={40} className="h-10 w-auto" priority />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <>
              {/* Desktop nav */}
              <div className="hidden sm:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/recipes/new">
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Nueva receta
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <Link href="/recipes/audio" aria-label="Agregar receta por audio">
                    <Mic className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <Link href="/settings" aria-label="Configuración">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile hamburger */}
              <div ref={menuRef} className="relative sm:hidden">
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen((v) => !v)} aria-label="Menú">
                  <Menu className="h-5 w-5" />
                </Button>
                {menuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-background border rounded-md shadow-md p-1 flex flex-col gap-0.5 z-50">
                    <Link href="/recipes/new" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted">
                      <PlusCircle className="h-4 w-4" /> Nueva receta
                    </Link>
                    <Link href="/recipes/audio" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted">
                      <Mic className="h-4 w-4" /> Receta por audio
                    </Link>
                    <Link href="/settings" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted">
                      <Settings className="h-4 w-4" /> Configuración
                    </Link>
                    <button onClick={() => { setMenuOpen(false); handleLogout() }}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted text-left">
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {!user && pathname !== "/login" && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Ingresar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
