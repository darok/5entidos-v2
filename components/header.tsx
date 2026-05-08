"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { PlusCircle, Settings, LogOut, Mic } from "lucide-react"

// Top navigation bar — scroll-aware: taller with larger logo at page top, compact on scroll
export function Header() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      setScrolled(prev => {
        if (!prev && y > 60) return true
        if (prev && y < 20) return false
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
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src={scrolled ? "/logo_icon.png" : "/logo_full.png"}
            alt="5entidos"
            width={200}
            height={200}
            className={`transition-all duration-300 ${scrolled ? "h-10 w-10" : "h-24 w-auto max-w-[96px]"}`}
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <>
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
