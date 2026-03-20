import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Specterfy — Privacy Pre-Processor for Pennsylvania Notaries',
    template: '%s — Specterfy',
  },
  description: 'Sanitize sensitive PDFs before they enter your workflow. A privacy-first pre-ingestion utility for Pennsylvania notaries. 5 free sanitizes/day.',
  metadataBase: new URL('https://specterfy.com'),
  keywords: [
    'Pennsylvania notary', 'PDF sanitizer', 'document redaction',
    'notary privacy tool', 'PDF privacy', 'document sanitization',
    'PA notary workflow', 'sensitive document tool',
  ],
  authors: [{ name: 'Specterfy' }],
  creator: 'Specterfy',
  publisher: 'Specterfy',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://specterfy.com',
  },
  openGraph: {
    title: 'Specterfy — Privacy Pre-Processor for Pennsylvania Notaries',
    description: 'Sanitize sensitive PDFs before they enter your workflow. Free to start. $9.97/mo unlimited.',
    url: 'https://specterfy.com',
    siteName: 'Specterfy',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Specterfy — Privacy Pre-Processor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Specterfy — Privacy Pre-Processor for Pennsylvania Notaries',
    description: 'Sanitize sensitive PDFs before they enter your workflow.',
    images: ['/og-image.png'],
  },
}

const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Specterfy',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '0',
    highPrice: '89',
    offerCount: '3',
  },
  description: 'Privacy pre-processor and PDF sanitization utility for Pennsylvania notaries.',
  url: 'https://specterfy.com',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
