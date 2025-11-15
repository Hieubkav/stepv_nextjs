# Core Web Vitals Optimization for Next.js

**Last Updated**: 2025-11-14
**Source**: Web.dev + Next.js Performance Best Practices

---

## Table of Contents

1. [What are Core Web Vitals](#what-are-core-web-vitals)
2. [LCP (Largest Contentful Paint)](#lcp-largest-contentful-paint)
3. [INP (Interaction to Next Paint)](#inp-interaction-to-next-paint)
4. [CLS (Cumulative Layout Shift)](#cls-cumulative-layout-shift)
5. [Measuring Core Web Vitals](#measuring-core-web-vitals)
6. [Next.js Built-in Optimizations](#nextjs-built-in-optimizations)
7. [Best Practices Summary](#best-practices-summary)

---

## What are Core Web Vitals

**Core Web Vitals** are Google's metrics for measuring user experience:

| Metric | Good | Needs Improvement | Poor | Measures |
|--------|------|-------------------|------|----------|
| **LCP** | ≤ 2.5s | 2.5s - 4.0s | > 4.0s | Loading performance |
| **INP** | ≤ 200ms | 200ms - 500ms | > 500ms | Interactivity |
| **CLS** | ≤ 0.1 | 0.1 - 0.25 | > 0.25 | Visual stability |

**Why they matter**:
- 🚀 **Better user experience**
- 📈 **Higher search rankings** (Google uses as ranking factor)
- 💰 **Higher conversion rates** (faster sites convert better)

---

## LCP (Largest Contentful Paint)

**What is LCP**: Time until largest content element is visible.

**Target**: ≤ 2.5 seconds

**Common LCP elements**:
- Hero images
- Large text blocks
- Video thumbnails

---

### LCP Optimization Strategies

#### 1. Optimize Images

**Use next/image with priority**:
```typescript
import Image from 'next/image'

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority // ✅ Preload LCP image
      quality={75} // Balance quality vs size
    />
  )
}
```

**Why it works**:
- `priority` adds `<link rel="preload">` for image
- Loads image early (not lazy-loaded)
- Prevents layout shift

---

#### 2. Serve Modern Image Formats

**Next.js automatically serves WebP/AVIF**:
```typescript
// next.config.ts
const config = {
  images: {
    formats: ['image/avif', 'image/webp'], // Default in Next.js 16
  },
}
```

**File size reduction**:
- WebP: ~25-35% smaller than JPEG
- AVIF: ~50% smaller than JPEG

---

#### 3. Preload Critical Resources

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        {/* Preload critical font */}
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Preload critical CSS */}
        <link rel="preload" href="/critical.css" as="style" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

#### 4. Use Server Components for Above-the-Fold Content

```typescript
// ✅ GOOD: Server Component renders immediately
export default async function Page() {
  const hero = await fetch('/api/hero').then(r => r.json())

  return (
    <div>
      <h1>{hero.title}</h1>
      <Image src={hero.image} alt={hero.title} priority width={1200} height={600} />
    </div>
  )
}
```

```typescript
// ❌ BAD: Client Component delays rendering
'use client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [hero, setHero] = useState(null)

  useEffect(() => {
    fetch('/api/hero').then(r => r.json()).then(setHero)
  }, [])

  if (!hero) return <div>Loading...</div>

  return <h1>{hero.title}</h1>
}
```

---

#### 5. Optimize Fonts

**Use next/font with display: 'swap'**:
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // ✅ Show fallback font while loading
  preload: true, // ✅ Preload font
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

**Why `display: 'swap'`**:
- Shows fallback font immediately
- Prevents invisible text (FOIT)
- Improves LCP

---

#### 6. Use Static Generation for LCP Content

```typescript
// Force static generation
export const dynamic = 'force-static'

export default async function Page() {
  const data = await fetch('/api/data').then(r => r.json())
  
  return (
    <div>
      <h1>{data.title}</h1>
      <Image src={data.hero} alt={data.title} priority width={1200} height={600} />
    </div>
  )
}
```

**Result**: Page HTML generated at build time → faster LCP.

---

#### 7. Optimize Server Response Time

**Use CDN for static assets**:
```typescript
// next.config.ts
const config = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.example.com' 
    : undefined,
}
```

**Cache API responses**:
```typescript
const data = await fetch('/api/data', {
  next: { revalidate: 3600 }, // Cache for 1 hour
})
```

---

### LCP Checklist

- [ ] Use `next/image` with `priority` for LCP image
- [ ] Serve WebP/AVIF formats
- [ ] Preload critical resources (fonts, images)
- [ ] Use Server Components for above-the-fold content
- [ ] Optimize fonts with `display: 'swap'`
- [ ] Use static generation when possible
- [ ] Optimize server response time (< 200ms)
- [ ] Use CDN for static assets
- [ ] Cache API responses appropriately

---

## INP (Interaction to Next Paint)

**What is INP**: Time from user interaction to visual response.

**Target**: ≤ 200ms

**Common INP issues**:
- Heavy JavaScript execution
- Large client bundles
- Blocking main thread

---

### INP Optimization Strategies

#### 1. Minimize Client-Side JavaScript

**Use Server Components by default**:
```typescript
// ✅ GOOD: Server Component (no client JS)
export default async function PostsList() {
  const posts = await fetch('/api/posts').then(r => r.json())

  return (
    <ul>
      {posts.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  )
}
```

```typescript
// ❌ BAD: Client Component (adds JS bundle)
'use client'
import { useEffect, useState } from 'react'

export default function PostsList() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(setPosts)
  }, [])

  return (
    <ul>
      {posts.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  )
}
```

---

#### 2. Code Splitting

**Dynamic imports for heavy components**:
```typescript
import dynamic from 'next/dynamic'

// Load chart library only when needed
const Chart = dynamic(() => import('./chart'), {
  ssr: false, // Don't render on server
  loading: () => <div>Loading chart...</div>,
})

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Chart data={data} /> {/* Loaded separately */}
    </div>
  )
}
```

---

#### 3. Defer Non-Critical Scripts

```typescript
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}

        {/* Load analytics after page interactive */}
        <Script
          src="https://analytics.example.com/script.js"
          strategy="lazyOnload" // ✅ Load after page interactive
        />
      </body>
    </html>
  )
}
```

**Script strategies**:
- `beforeInteractive` - Load before page interactive (critical scripts)
- `afterInteractive` - Load after page interactive (default)
- `lazyOnload` - Load during idle time (analytics, ads)

---

#### 4. Optimize Event Handlers

**Debounce expensive operations**:
```typescript
'use client'

import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export function SearchBox() {
  const [results, setResults] = useState([])

  const search = useDebouncedCallback(async (query: string) => {
    const data = await fetch(`/api/search?q=${query}`).then(r => r.json())
    setResults(data)
  }, 300) // Wait 300ms after user stops typing

  return (
    <input
      type="text"
      onChange={e => search(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

---

#### 5. Use Server Actions for Mutations

**Server Actions reduce client JS**:
```typescript
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  await db.post.create({ data: { title } })
  revalidatePath('/posts')
}

// app/components/create-post-form.tsx
import { createPost } from '@/app/actions'

export function CreatePostForm() {
  return (
    <form action={createPost}> {/* ✅ No client JS needed */}
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  )
}
```

---

#### 6. Analyze Bundle Size

```bash
npm install -D @next/bundle-analyzer
```

```typescript
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const config = {
  // ... your config
}

export default withBundleAnalyzer(config)
```

```bash
ANALYZE=true npm run build
```

**Look for**:
- Large dependencies (> 100KB)
- Duplicate packages
- Unused code

---

### INP Checklist

- [ ] Use Server Components to minimize client JS
- [ ] Dynamic import heavy components
- [ ] Defer non-critical scripts (`lazyOnload`)
- [ ] Debounce expensive operations
- [ ] Use Server Actions for mutations
- [ ] Analyze bundle size (< 200KB main bundle)
- [ ] Remove unused dependencies
- [ ] Avoid blocking main thread (use Web Workers if needed)

---

## CLS (Cumulative Layout Shift)

**What is CLS**: Amount of unexpected layout shift.

**Target**: ≤ 0.1

**Common CLS causes**:
- Images without dimensions
- Fonts causing layout shift
- Dynamic content inserted above existing content

---

### CLS Optimization Strategies

#### 1. Set Image Dimensions

**Always set width and height**:
```typescript
// ✅ GOOD: Dimensions set
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>
```

```typescript
// ❌ BAD: No dimensions (causes CLS)
<Image
  src="/hero.jpg"
  alt="Hero"
  priority
/>
```

---

#### 2. Reserve Space for Ads/Embeds

```typescript
// ✅ GOOD: Reserve space for ad
<div className="ad-container" style={{ minHeight: '250px' }}>
  <AdComponent />
</div>
```

```typescript
// ❌ BAD: No reserved space (causes CLS)
<AdComponent />
```

---

#### 3. Use font-display: swap

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // ✅ Prevents layout shift
})
```

---

#### 4. Avoid Inserting Content Above Existing Content

**❌ BAD: Insert banner at top (causes CLS)**:
```typescript
'use client'
import { useState, useEffect } from 'react'

export function Page() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowBanner(true), 2000)
  }, [])

  return (
    <div>
      {showBanner && <div>Banner</div>} {/* ❌ Shifts content down */}
      <h1>Page Title</h1>
      <p>Content</p>
    </div>
  )
}
```

**✅ GOOD: Use fixed position or append at bottom**:
```typescript
'use client'
import { useState, useEffect } from 'react'

export function Page() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowBanner(true), 2000)
  }, [])

  return (
    <div>
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50"> {/* ✅ Fixed position */}
          Banner
        </div>
      )}
      <h1>Page Title</h1>
      <p>Content</p>
    </div>
  )
}
```

---

#### 5. Use Suspense for Dynamic Content

```typescript
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Page Title</h1>

      <Suspense fallback={<Skeleton />}> {/* ✅ Reserve space with skeleton */}
        <DynamicContent />
      </Suspense>
    </div>
  )
}

function Skeleton() {
  return <div className="h-40 bg-gray-200 animate-pulse" />
}
```

---

#### 6. Preload Critical Fonts

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

### CLS Checklist

- [ ] Set width/height for all images
- [ ] Reserve space for ads/embeds
- [ ] Use `font-display: swap` for fonts
- [ ] Preload critical fonts
- [ ] Avoid inserting content above existing content
- [ ] Use Suspense with skeleton loaders
- [ ] Don't change dimensions after load
- [ ] Test on slow connections (throttle network in DevTools)

---

## Measuring Core Web Vitals

### 1. Next.js Speed Insights (Recommended)

```bash
npm install @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights /> {/* ✅ Real User Monitoring */}
      </body>
    </html>
  )
}
```

**Dashboard**: https://vercel.com/analytics (if deployed on Vercel)

---

### 2. Google Lighthouse (Dev Tools)

```bash
# CLI
npx lighthouse https://your-site.com --view

# Or use Chrome DevTools
# 1. Open DevTools (F12)
# 2. Click "Lighthouse" tab
# 3. Click "Analyze page load"
```

---

### 3. PageSpeed Insights

**URL**: https://pagespeed.web.dev/

**Enter your URL** and see:
- Field data (real users)
- Lab data (simulated)
- Recommendations

---

### 4. Web Vitals Library

```bash
npm install web-vitals
```

```typescript
// app/components/web-vitals.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric)

    // Send to analytics
    if (metric.label === 'web-vital') {
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(metric),
      })
    }
  })

  return null
}

// app/layout.tsx
import { WebVitals } from './components/web-vitals'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <WebVitals />
      </body>
    </html>
  )
}
```

---

## Next.js Built-in Optimizations

Next.js includes automatic optimizations:

| Feature | Optimization | Benefit |
|---------|-------------|---------|
| **`next/image`** | Automatic resizing, WebP/AVIF, lazy loading | Smaller images, faster LCP |
| **`next/font`** | Font optimization, preloading | Faster font loading, no CLS |
| **Code Splitting** | Automatic route-level splitting | Smaller initial bundle, faster INP |
| **Server Components** | Zero client JS by default | Faster INP |
| **Static Generation** | HTML prerendered at build | Faster LCP |
| **Incremental Static Regeneration** | Update static pages without rebuild | Faster LCP with fresh content |

---

## Best Practices Summary

### LCP (< 2.5s)
- ✅ Use `next/image` with `priority` for hero images
- ✅ Serve WebP/AVIF formats
- ✅ Preload critical resources
- ✅ Use Server Components for above-the-fold content
- ✅ Optimize fonts with `display: 'swap'`
- ✅ Use static generation when possible
- ✅ Optimize server response time

### INP (< 200ms)
- ✅ Minimize client-side JavaScript
- ✅ Use Server Components by default
- ✅ Dynamic import heavy components
- ✅ Defer non-critical scripts
- ✅ Debounce expensive operations
- ✅ Use Server Actions for mutations
- ✅ Analyze and reduce bundle size

### CLS (< 0.1)
- ✅ Set dimensions for all images
- ✅ Reserve space for ads/embeds
- ✅ Use `font-display: swap`
- ✅ Preload critical fonts
- ✅ Avoid inserting content above existing content
- ✅ Use Suspense with skeleton loaders

---

## Quick Wins Checklist

**30 minutes improvements**:
- [ ] Add `priority` to hero image
- [ ] Set `display: 'swap'` for fonts
- [ ] Set dimensions for all images
- [ ] Add `@vercel/speed-insights`
- [ ] Run Lighthouse audit

**1 hour improvements**:
- [ ] Convert Client Components to Server Components
- [ ] Dynamic import heavy components
- [ ] Defer non-critical scripts
- [ ] Add Suspense with skeletons
- [ ] Optimize image formats (WebP/AVIF)

**1 day improvements**:
- [ ] Implement static generation
- [ ] Analyze bundle size and remove large deps
- [ ] Add CDN for static assets
- [ ] Optimize API response times
- [ ] Implement proper caching strategy

---

## Resources

- **Web.dev Core Web Vitals**: https://web.dev/vitals/
- **Next.js Performance Docs**: https://nextjs.org/docs/app/building-your-application/optimizing
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Vercel Speed Insights**: https://vercel.com/docs/speed-insights
