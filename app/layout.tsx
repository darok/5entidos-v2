import type { Metadata, Viewport } from "next"
import Image from "next/image"
import Link from "next/link"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "5entidos",
  description: "Tu recetario personal",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "5entidos",
    statusBarStyle: "default",
  },
  icons: { apple: "/icon-192.png" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <Header />
          <main>{children}</main>
          <footer className="border-t mt-16 py-6 text-center text-sm text-muted-foreground">
            <Link href="/" className="inline-block mb-2 hover:opacity-80">
              <Image src="/logo_simple.png" alt="5entidos" width={32} height={32} />
            </Link>
            <p>
              Desarrollado por{" "}
              <a href="mailto:darokalmus@gmail.com" className="underline underline-offset-2 hover:text-foreground">
                DaroK
              </a>
              , 2026
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
