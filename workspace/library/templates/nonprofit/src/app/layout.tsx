import type { Metadata } from 'next'
import { Source_Sans_3, Merriweather } from 'next/font/google'
import './globals.css'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
})

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
})

export const metadata: Metadata = {
  title: '{{APP_NAME}} - Association',
  description: 'Ensemble, faisons la difference. Soutenez notre cause et changez des vies.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${sourceSans.variable} ${merriweather.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
