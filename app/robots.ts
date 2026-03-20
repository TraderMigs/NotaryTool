import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/account', '/sanitize', '/review', '/dashboard', '/api/'],
      },
    ],
    sitemap: 'https://specterfy.com/sitemap.xml',
    host: 'https://specterfy.com',
  }
}
