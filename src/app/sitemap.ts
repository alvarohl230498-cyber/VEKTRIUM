import type { MetadataRoute } from 'next'
import { projects, siteUrl } from '@/site/content'

const staticRoutes = [
  '/',
  '/servicios',
  '/metodo',
  '/proyectos',
  '/fundadores',
  '/paquetes',
  '/recursos',
  '/vek-proof',
  '/contacto',
  '/agenda',
  '/privacidad',
  '/terminos',
  '/libro-reclamaciones',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const projectRoutes = projects.map((project) => `/proyectos/${project.slug}`)
  const routes = [...staticRoutes, ...projectRoutes]

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date('2026-07-29'),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }))
}
