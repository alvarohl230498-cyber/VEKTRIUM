import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import { brand, siteUrl } from '@/site/content'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'VEKTRIUM | Automatizacion, datos y productos digitales',
    template: '%s | VEKTRIUM',
  },
  description: brand.description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'VEKTRIUM',
    description: brand.description,
    images: ['/hero-vektrium.png'],
    siteName: 'VEKTRIUM',
    locale: 'es_PE',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: siteUrl,
    description: brand.description,
  }

  return (
    <html lang="es" className={`${manrope.variable} ${inter.variable}`}>
      <body className="bg-vk-ice text-vk-ink font-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
