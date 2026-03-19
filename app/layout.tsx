import type { Metadata } from 'next'
import { Syne, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--syne',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Specterfy — Privacy Pre-Processor',
  description: 'Sanitize sensitive PDFs before they move into downstream handling. A privacy-first utility for Pennsylvania notaries.',
  metadataBase: new URL('https://specterfy.com'),
  openGraph: {
    title: 'Specterfy — Privacy Pre-Processor',
    description: 'Sanitize sensitive PDFs before they enter your workflow.',
    url: 'https://specterfy.com',
    siteName: 'Specterfy',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${jakarta.variable}`}>
      <body style={{ fontFamily: 'var(--jakarta, sans-serif)' }}>
        {children}
      </body>
    </html>
  )
}
