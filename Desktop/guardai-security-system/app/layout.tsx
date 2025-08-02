import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SoundProvider } from "@/components/audio/sound-manager"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GuardAI - AI-Powered Security Monitoring",
  description: "Advanced real-time surveillance with computer vision and sound anomaly detection",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <SoundProvider>
            {children}
            <Toaster />
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
