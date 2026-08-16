'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
