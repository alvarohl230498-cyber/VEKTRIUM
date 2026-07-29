/**
 * Las unicas cinco entradas que existen hoy en VEKTRIUM OS. No se agregan
 * destinos deshabilitados ni "proximamente": un menu con enlaces muertos
 * hace que el producto se perciba abandonado (seccion 31 del prompt maestro,
 * ver docs/superpowers/specs/2026-07-29-vektrium-sp0-sp1-design.md, s.7).
 */
export const OS_NAV_ITEMS = [
  { href: '/os', label: 'Inicio' },
  { href: '/os/agenda', label: 'Agenda' },
  { href: '/os/oportunidades', label: 'Oportunidades' },
  { href: '/os/clientes', label: 'Clientes' },
  { href: '/os/proyectos', label: 'Proyectos' },
] as const
