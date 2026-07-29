import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'VEKTRIUM',
  description: 'Automatización, Datos y Productos Digitales',
  openGraph: {
    title: 'VEKTRIUM',
    description: 'Automatización, Datos y Productos Digitales',
    images: ['/hero-vektrium.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${manrope.variable} ${inter.variable}`}>
      <body className="bg-vk-ice text-vk-ink font-body antialiased">{children}</body>
    </html>
  )
}
