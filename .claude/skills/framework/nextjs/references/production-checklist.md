# Next.js Production Deployment Checklist

**Last Updated**: 2025-11-14
**Purpose**: Comprehensive checklist before deploying Next.js applications to production

---

## Table of Contents

1. [Pre-Deployment](#pre-deployment)
2. [Performance](#performance)
3. [Security](#security)
4. [SEO](#seo)
5. [Monitoring & Analytics](#monitoring--analytics)
6. [Build & Deployment](#build--deployment)
7. [Post-Deployment](#post-deployment)

---

## Pre-Deployment

### Code Quality

- [ ] **All TypeScript errors fixed**
  ```bash
  npx tsc --noEmit
  ```

- [ ] **Linting passes**
  ```bash
  npx eslint .
  ```

- [ ] **All tests passing**
  ```bash
  npm test
  ```

- [ ] **No console.log statements in production code**
  ```bash
  grep -r "console.log" app/ --exclude-dir=node_modules
  ```

- [ ] **Dead code removed**
  - Remove unused imports
  - Remove commented code
  - Remove unused components

---

### Dependencies

- [ ] **Production dependencies only**
  ```bash
  npm prune --production
  ```

- [ ] **Audit for vulnerabilities**
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] **Update outdated packages**
  ```bash
  npm outdated
  npm update
  ```

- [ ] **Remove unused dependencies**
  ```bash
  npx depcheck
  ```

---

### Environment Variables

- [ ] **All required env vars documented**
  - Create `.env.example` with all variables
  - Document purpose of each variable

- [ ] **No secrets in code**
  ```bash
  # Search for common secret patterns
  grep -r "API_KEY" app/ --exclude-dir=node_modules
  grep -r "SECRET" app/ --exclude-dir=node_modules
  ```

- [ ] **Server-only secrets not prefixed with NEXT_PUBLIC_**
  ```typescript
  // ✅ Good
  const secret = process.env.SECRET_KEY

  // ❌ Bad (exposed to client)
  const secret = process.env.NEXT_PUBLIC_SECRET_KEY
  ```

- [ ] **Environment-specific configs set**
  - Development: `.env.local`
  - Staging: `.env.staging`
  - Production: `.env.production`

---

## Performance

### Images

- [ ] **All images optimized**
  - Use `next/image` component
  - Serve WebP/AVIF formats
  - Set proper width/height
  - Use `priority` for above-the-fold images

  ```typescript
  // ✅ Good
  <Image
    src="/hero.jpg"
    alt="Hero"
    width={1200}
    height={600}
    priority
  />
  ```

- [ ] **Remote images configured**
  ```typescript
  // next.config.ts
  const config = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cdn.example.com',
        },
      ],
    },
  }
  ```

- [ ] **Image sizes optimized**
  - Configure `imageSizes` for your use case
  - Set appropriate `minimumCacheTTL`

---

### Fonts

- [ ] **Fonts optimized with next/font**
  ```typescript
  import { Inter } from 'next/font/google'

  const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
  })
  ```

- [ ] **Preload critical fonts**
  - Use `display: 'swap'` to avoid FOIT (Flash of Invisible Text)

---

### Code Splitting

- [ ] **Dynamic imports for heavy components**
  ```typescript
  import dynamic from 'next/dynamic'

  const HeavyChart = dynamic(() => import('./heavy-chart'), {
    ssr: false,
    loading: () => <div>Loading...</div>,
  })
  ```

- [ ] **Route-level code splitting verified**
  ```bash
  npm run build
  # Check .next/static/chunks/ for proper splitting
  ```

---

### Caching

- [ ] **Static pages cached**
  ```typescript
  export const dynamic = 'force-static'
  ```

- [ ] **ISR configured for semi-static pages**
  ```typescript
  export const revalidate = 3600 // Revalidate every hour
  ```

- [ ] **Cache Components with "use cache"**
  ```typescript
  'use cache'
  export async function ExpensiveComponent() {
    // Expensive computation
  }
  ```

- [ ] **API responses cached appropriately**
  ```typescript
  const data = await fetch('/api/data', {
    next: { revalidate: 60 },
  })
  ```

---

### Bundle Size

- [ ] **Bundle analyzed**
  ```bash
  npm install -D @next/bundle-analyzer
  # Add to next.config.ts
  ANALYZE=true npm run build
  ```

- [ ] **No large dependencies in client bundles**
  - Move server-only code to Server Components
  - Use dynamic imports for large libraries

- [ ] **Tree-shaking verified**
  - Import only what you need
  ```typescript
  // ✅ Good
  import { Button } from '@/components/button'

  // ❌ Bad
  import * as Components from '@/components'
  ```

---

### Core Web Vitals

- [ ] **LCP (Largest Contentful Paint) < 2.5s**
  - Optimize hero images
  - Preload critical resources
  - Use Server Components for above-the-fold content

- [ ] **FID (First Input Delay) < 100ms**
  - Minimize JavaScript execution
  - Use Server Components to reduce client JS
  - Defer non-critical scripts

- [ ] **CLS (Cumulative Layout Shift) < 0.1**
  - Set image dimensions
  - Reserve space for ads/embeds
  - Avoid inserting content above existing content

- [ ] **Run Lighthouse audit**
  ```bash
  npx lighthouse https://your-site.com --view
  ```

---

## Security

### Authentication & Authorization

- [ ] **Authentication implemented**
  - Use Clerk, Auth.js, or similar
  - Secure cookies (httpOnly, secure, sameSite)

- [ ] **Authorization checks in Server Components**
  ```typescript
  export default async function AdminPage() {
    const session = await getSession()
    if (!session?.user?.isAdmin) {
      redirect('/unauthorized')
    }
    // Admin content
  }
  ```

- [ ] **API routes protected**
  ```typescript
  export async function GET(request: Request) {
    const session = await getSession()
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }
    // Protected endpoint
  }
  ```

---

### Data Security

- [ ] **Data Access Layer (DAL) implemented**
  ```typescript
  // lib/dal.ts
  'use server'
  import { verifySession } from './session'

  export async function getUser() {
    const session = await verifySession()
    if (!session) throw new Error('Unauthorized')
    return db.user.findUnique({ where: { id: session.userId } })
  }
  ```

- [ ] **Input validation on all forms**
  ```typescript
  import { z } from 'zod'

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  })

  export async function createUser(formData: FormData) {
    const parsed = schema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors }
    }
    // Create user
  }
  ```

- [ ] **SQL injection prevention**
  - Use parameterized queries or ORM (Prisma, Drizzle)
  - Never concatenate user input into SQL

- [ ] **XSS prevention**
  - React escapes by default
  - Avoid `dangerouslySetInnerHTML` unless necessary
  - Sanitize user-generated HTML

- [ ] **CSRF protection**
  - Next.js Server Actions include CSRF tokens by default

---

### Headers & HTTPS

- [ ] **Security headers configured**
  ```typescript
  // next.config.ts
  const config = {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on',
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin',
            },
          ],
        },
      ]
    },
  }
  ```

- [ ] **HTTPS enforced**
  - Redirect HTTP to HTTPS
  - Use HSTS header

- [ ] **CSP (Content Security Policy) configured**
  ```typescript
  // next.config.ts
  const config = {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
            },
          ],
        },
      ]
    },
  }
  ```

---

### Rate Limiting

- [ ] **API rate limiting implemented**
  ```typescript
  import { Ratelimit } from '@upstash/ratelimit'
  import { Redis } from '@upstash/redis'

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
  })

  export async function POST(request: Request) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return new Response('Too Many Requests', { status: 429 })
    }
    // Handle request
  }
  ```

---

## SEO

### Metadata

- [ ] **Page titles unique and descriptive**
  ```typescript
  export const metadata = {
    title: 'About Us | Company Name',
    description: 'Learn about our company and mission',
  }
  ```

- [ ] **Meta descriptions < 160 characters**

- [ ] **Open Graph tags configured**
  ```typescript
  export const metadata = {
    openGraph: {
      title: 'Page Title',
      description: 'Page description',
      images: ['/og-image.jpg'],
      url: 'https://example.com/page',
    },
  }
  ```

- [ ] **Twitter Card tags configured**
  ```typescript
  export const metadata = {
    twitter: {
      card: 'summary_large_image',
      title: 'Page Title',
      description: 'Page description',
      images: ['/twitter-image.jpg'],
    },
  }
  ```

---

### Structured Data

- [ ] **JSON-LD structured data added**
  ```typescript
  export default function Page() {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Company Name',
      url: 'https://example.com',
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Page content */}
      </>
    )
  }
  ```

---

### Sitemap & Robots

- [ ] **Sitemap generated**
  ```typescript
  // app/sitemap.ts
  import type { MetadataRoute } from 'next'

  export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await fetch('/api/posts').then(r => r.json())

    return [
      {
        url: 'https://example.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      ...posts.map(post => ({
        url: `https://example.com/posts/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      })),
    ]
  }
  ```

- [ ] **robots.txt configured**
  ```typescript
  // app/robots.ts
  import type { MetadataRoute } from 'next'

  export default function robots(): MetadataRoute.Robots {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: '/admin/',
      },
      sitemap: 'https://example.com/sitemap.xml',
    }
  }
  ```

---

### Accessibility

- [ ] **Alt text for all images**
  ```typescript
  <Image src="/hero.jpg" alt="Descriptive alt text" width={1200} height={600} />
  ```

- [ ] **ARIA labels for interactive elements**
  ```typescript
  <button aria-label="Close modal" onClick={close}>
    <X />
  </button>
  ```

- [ ] **Keyboard navigation works**
  - Test with Tab key
  - Test with Enter/Space for actions

- [ ] **Color contrast meets WCAG AA standards**
  - Use tools like WebAIM Contrast Checker

---

## Monitoring & Analytics

### Error Tracking

- [ ] **Error monitoring configured (Sentry, LogRocket)**
  ```typescript
  // instrumentation.ts
  export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config')
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config')
    }
  }
  ```

---

### Analytics

- [ ] **Analytics configured (Vercel Analytics, Google Analytics)**
  ```typescript
  // app/layout.tsx
  import { Analytics } from '@vercel/analytics/react'

  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          {children}
          <Analytics />
        </body>
      </html>
    )
  }
  ```

---

### Performance Monitoring

- [ ] **Real User Monitoring (RUM) configured**
  ```typescript
  import { SpeedInsights } from '@vercel/speed-insights/next'

  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          {children}
          <SpeedInsights />
        </body>
      </html>
    )
  }
  ```

---

### Logging

- [ ] **Structured logging implemented**
  ```typescript
  import pino from 'pino'

  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
  })

  logger.info({ userId: '123', action: 'login' }, 'User logged in')
  ```

---

## Build & Deployment

### Build Configuration

- [ ] **Production build succeeds**
  ```bash
  npm run build
  ```

- [ ] **No build warnings**
  - Review build output for warnings
  - Fix or suppress intentional warnings

- [ ] **Build output verified**
  - Check `.next/` directory
  - Verify static pages generated
  - Check bundle sizes

---

### Deployment

- [ ] **Deploy to staging first**
  - Test all features on staging
  - Run smoke tests

- [ ] **Database migrations run**
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **Environment variables set in production**
  - Verify all required env vars
  - Use secrets management (Vercel, AWS Secrets Manager)

- [ ] **CDN configured**
  - Static assets served from CDN
  - Cache headers configured

- [ ] **Health check endpoint created**
  ```typescript
  // app/api/health/route.ts
  export async function GET() {
    return Response.json({ status: 'ok' })
  }
  ```

---

### Rollback Plan

- [ ] **Rollback procedure documented**
  - Document steps to revert to previous version
  - Test rollback on staging

- [ ] **Database migration rollback plan**
  - Create down migrations
  - Test rollback procedures

---

## Post-Deployment

### Smoke Tests

- [ ] **Homepage loads**
- [ ] **Authentication works**
- [ ] **Critical user flows work**
- [ ] **Payment processing works (if applicable)**
- [ ] **API endpoints respond**

---

### Monitoring

- [ ] **Check error rates**
  - Monitor Sentry/error tracker for spikes

- [ ] **Check performance metrics**
  - Monitor Core Web Vitals
  - Check response times

- [ ] **Check logs**
  - Review application logs for errors
  - Check server logs

---

### SEO Verification

- [ ] **Google Search Console verified**
  - Submit sitemap
  - Check for crawl errors

- [ ] **Structured data validated**
  - Use Google Rich Results Test

- [ ] **Social sharing works**
  - Test Open Graph tags
  - Test Twitter Card tags

---

## Quick Checklist Summary

### Must-Have (Critical)
- [ ] TypeScript errors fixed
- [ ] Tests passing
- [ ] No secrets in code
- [ ] HTTPS enabled
- [ ] Authentication working
- [ ] Error monitoring configured
- [ ] Production build succeeds
- [ ] Smoke tests pass

### Should-Have (Important)
- [ ] Images optimized
- [ ] Fonts optimized
- [ ] Bundle analyzed
- [ ] Security headers configured
- [ ] Metadata configured
- [ ] Sitemap generated
- [ ] Analytics configured
- [ ] Staging tested

### Nice-to-Have (Recommended)
- [ ] CSP configured
- [ ] Rate limiting implemented
- [ ] Structured data added
- [ ] Performance monitoring
- [ ] Rollback plan documented

---

## Resources

- **Next.js Production Docs**: https://nextjs.org/docs/app/building-your-application/deploying
- **Web.dev Best Practices**: https://web.dev/learn/
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
