import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ChatBot } from '../components/ChatBot'
import { CookieConsent } from '../components/CookieConsent'
import PushNotificationBanner from '../components/PushNotificationBanner'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinynest.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TinyNest – Tiny Houses for Sale & Rent | #1 Tiny Home Marketplace USA',
    template: '%s | TinyNest – Tiny House Marketplace',
  },
  description:
    'TinyNest is the #1 tiny house marketplace in the USA. Buy, sell, and rent tiny homes, cabins on wheels, and container homes. Browse 12,400+ verified tiny house listings.',
  keywords: [
    'tiny houses for sale',
    'tiny home listings',
    'buy tiny house',
    'sell tiny house',
    'tiny house marketplace',
    'tiny homes for rent',
    'affordable tiny homes',
    'tiny house on wheels',
    'THOW',
    'container homes for sale',
    'off-grid tiny house',
    'tiny living',
    'tiny house communities',
    'tiny house zoning laws',
    'tiny house financing',
  ],
  authors: [{ name: 'TinyNest Inc.', url: siteUrl }],
  creator: 'TinyNest Inc.',
  publisher: 'TinyNest Inc.',
  category: 'Real Estate',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'TinyNest',
    title: 'TinyNest – Tiny Houses for Sale & Rent | #1 Tiny Home Marketplace USA',
    description:
      'Browse 12,400+ tiny house listings across America. Buy, sell, or rent verified tiny homes, cabins, and container homes at TinyNest.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'TinyNest – Tiny House Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tinynest',
    creator: '@tinynest',
    title: 'TinyNest – Tiny Houses for Sale & Rent | USA Marketplace',
    description:
      'Browse 12,400+ verified tiny homes across America. Buy, sell, and rent tiny houses at TinyNest.',
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Leaflet map — loaded globally so all map components share one instance */}
        <link rel="stylesheet" href="/leaflet.css" />
        <link rel="stylesheet" href="/MarkerCluster.css" />
        <link rel="stylesheet" href="/MarkerCluster.Default.css" />
        {/* Scripts must be in order: leaflet first, then markercluster */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/leaflet.js" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/leaflet.markercluster.js" />
      </head>
      <body className={`${dmSans.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        {children}
        <ChatBot />
        <CookieConsent />
        <PushNotificationBanner />
      </body>
    </html>
  )
}
