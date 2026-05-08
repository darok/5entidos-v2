import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "5entidos",
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
        </Providers>
      </body>
    </html>
  )
}
