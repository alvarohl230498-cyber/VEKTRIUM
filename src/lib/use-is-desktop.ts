'use client'

import { useEffect, useState } from 'react'

/**
 * true si el viewport es de escritorio. Usado por los tableros con arrastre
 * (Planner de tareas, tablero de proyectos por fase) para decidir entre
 * arrastrar-y-soltar (escritorio) o un <select> por tarjeta (movil, donde
 * el drag nativo no es utilizable).
 */
export function useIsDesktop(breakpointPx = 768): boolean {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${breakpointPx}px)`)
    const update = () => setIsDesktop(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [breakpointPx])

  return isDesktop
}
