import type { MetadataRoute } from 'next'
import { siteUrl } from '@/site/content'

const staticRoutes = [
  '/',
  '/privacidad',
  '/terminos',
  '/libro-reclamaciones',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date('2026-07-29'),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }))
}
