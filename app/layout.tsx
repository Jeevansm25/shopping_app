import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { MainNavigation } from "@/components/MainNavigation"

const ivmFont = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Quantum Shopping Experience",
  description: "Next-generation shopping platform with quantum-powered recommendations",
  generator: "v0.dev",
  icons: {
    icon: '/favicon.ico',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={ivmFont.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <header className="border-b">
                <div className="container mx-auto py-4">
                  <MainNavigation />
                </div>
              </header>
              <main className="flex-1">
                {children}
              </main>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}