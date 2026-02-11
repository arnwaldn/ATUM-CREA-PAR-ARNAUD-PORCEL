import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import { WebVitalsInit } from "@/components/web-vitals-init"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "{{APP_NAME}} - Dashboard",
  description: "{{APP_DESCRIPTION}}",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="fr" suppressHydrationWarning>
        <body className={inter.className}>
          <WebVitalsInit />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
