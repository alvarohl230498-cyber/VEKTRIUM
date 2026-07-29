import type { MetadataRoute } from 'next'
import { siteUrl } from '@/site/content'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/os'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
