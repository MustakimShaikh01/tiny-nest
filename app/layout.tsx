import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'TinyNest – Tiny Houses for Sale, Rent & Buy | Marketplace',
  description: 'TinyNest is the #1 tiny house marketplace. Buy, sell, and rent tiny homes across the USA.',
  keywords: 'tiny houses for sale, tiny home listings, buy tiny house, sell tiny house, tiny house marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
