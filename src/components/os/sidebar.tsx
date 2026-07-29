'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { OS_NAV_ITEMS } from './nav-items'

/**
 * Resalta la entrada activa con `usePathname`, que solo existe en cliente.
 * Es la unica razon para que este componente no sea un Server Component.
 */
export function OsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="min-w-0 bg-vk-navy px-3 py-4 text-white lg:px-5 lg:py-6">
      <p className="hidden font-display text-lg font-extrabold lg:block">VEKTRIUM OS</p>
      <nav aria-label="Portal privado" className="mt-0 min-w-0 lg:mt-8">
        <ul className="flex min-w-0 gap-2 overflow-x-auto lg:flex-col lg:gap-2 lg:overflow-visible">
          {OS_NAV_ITEMS.map((item) => {
            const isActive = item.href === '/os' ? pathname === '/os' : pathname.startsWith(item.href)
            return (
              <li key={item.href} className="shrink-0 lg:shrink">
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    isActive
                      ? 'block rounded-md bg-vk-cobalt px-3 py-2 text-sm font-bold text-white'
                      : 'block rounded-md px-3 py-2 text-sm font-bold text-[#B8C7E6] transition hover:bg-white/5 hover:text-white'
                  }
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
