import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--dm-sans',
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
    <html lang="en" className={dmSans.variable}>
      <body>
        {children}
      </body>
    </html>
  )
}
