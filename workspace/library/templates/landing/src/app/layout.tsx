import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { WebVitalsInit } from "@/components/web-vitals-init"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "{{APP_NAME}} - {{APP_TAGLINE}}",
  description: "{{APP_DESCRIPTION}}",
  openGraph: {
    title: "{{APP_NAME}}",
    description: "{{APP_DESCRIPTION}}",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={inter.className}>
        <WebVitalsInit />
        {children}
      </body>
    </html>
  )
}
