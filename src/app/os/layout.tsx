import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { OsHeader } from '@/components/os/header'
import { OsSidebar } from '@/components/os/sidebar'
import { requireSession } from '@/lib/session'

export const metadata: Metadata = {
  title: {
    default: 'VEKTRIUM OS',
    template: '%s | VEKTRIUM OS',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function OsLayout({ children }: { children: ReactNode }) {
  const session = await requireSession()

  return (
    <div className="grid min-h-screen grid-rows-[auto_auto_1fr] bg-vk-ice text-vk-ink lg:grid-cols-[240px_minmax(0,1fr)] lg:grid-rows-[1fr]">
      <OsSidebar />
      <div className="flex min-w-0 flex-col">
        <OsHeader user={session.user} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
