"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { PlusCircle, Settings, LogOut } from "lucide-react"

interface HeaderProps {
  title?: string
}

// Top navigation bar — shows owner actions when logged in
export function Header({ title = "Recetario" }: HeaderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight hover:opacity-80">
          {title}
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
