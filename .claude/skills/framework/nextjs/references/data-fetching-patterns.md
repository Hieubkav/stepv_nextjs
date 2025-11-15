# Next.js Data Fetching Patterns & Best Practices

**Last Updated**: 2025-11-14
**Source**: Next.js Official Documentation + Production Experience

---

## Table of Contents

1. [Overview](#overview)
2. [Server-Side Data Fetching](#server-side-data-fetching)
3. [Parallel vs Sequential Fetching](#parallel-vs-sequential-fetching)
4. [Request Deduplication](#request-deduplication)
5. [Streaming with Suspense](#streaming-with-suspense)
6. [Error Handling](#error-handling)
7. [Loading States](#loading-states)
8. [Data Fetching Libraries](#data-fetching-libraries)
9. [Best Practices](#best-practices)

---

## Overview

Next.js App Router enables data fetching in Server Components with:
- ✅ **Server-side fetching** - Secure, fast, reduces client bundle
- ✅ **Parallel fetching** - Multiple requests simultaneously
- ✅ **Request deduplication** - Automatic caching of identical requests
- ✅ **Streaming** - Progressive UI rendering with Suspense

**Key Principle**: Fetch data as close to where it's needed as possible.

---

## Server-Side Data Fetching

### Pattern 1: Fetch in Server Components

**Recommended**: Fetch directly in Server Components (not in Client Components).

```typescript
// ✅ GOOD: Fetch in Server Component
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Direct fetch in component
  const product = await fetch(`https://api.example.com/products/${id}`)
    .then(res => res.json())

  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
    </div>
  )
}
```

```typescript
// ❌ BAD: Fetch in Client Component (useEffect)
'use client'
import { useEffect, useState } from 'react'

export default function ProductPage() {
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetch('/api/products/123')
      .then(res => res.json())
      .then(data => setProduct(data))
  }, [])

  if (!product) return <div>Loading...</div>
  return <div>{product.name}</div>
}
```

**Why Server-Side is Better**:
- ⚡ Faster - Data available on initial render
- 🔒 Secure - API keys stay on server
- 📦 Smaller bundle - No fetch logic in client
- 🎯 SEO-friendly - Content available for crawlers

---

### Pattern 2: Localized Data Fetching

**Recommended**: Fetch data in the component that needs it (not in parent layout).

```typescript
// ✅ GOOD: Fetch in component that needs it
// app/dashboard/page.tsx
async function UserProfile() {
  const user = await fetch('/api/user').then(r => r.json())
  return <div>{user.name}</div>
}

async function RecentPosts() {
  const posts = await fetch('/api/posts').then(r => r.json())
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}

export default function Dashboard() {
  return (
    <div>
      <UserProfile /> {/* Fetches own data */}
      <RecentPosts /> {/* Fetches own data */}
    </div>
  )
}
```

```typescript
// ❌ BAD: Fetch everything in layout, pass as props
// app/dashboard/layout.tsx
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await fetch('/api/user').then(r => r.json())
  const posts = await fetch('/api/posts').then(r => r.json())
  
  // Props drilling issues
  return <div>{children}</div>
}
```

**Why Localized is Better**:
- 🎯 Component-level ownership
- 🔄 Automatic request deduplication (Next.js caches identical requests)
- 🧩 Better separation of concerns

---

### Pattern 3: Cache Control with `fetch()`

**Cache by default** (Next.js 16 opt-in with `"use cache"`):

```typescript
// Cache with "use cache" directive
'use cache'
export async function getStaticData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

// Or cache with fetch options (legacy)
const staticData = await fetch('https://api.example.com/data', {
  cache: 'force-cache', // Default in Next.js 15 (opt-in in 16)
})

// Revalidate every 60 seconds
const revalidatedData = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 },
})

// No cache (always fresh)
const dynamicData = await fetch('https://api.example.com/data', {
  cache: 'no-store',
})
```

**Tag-based revalidation**:

```typescript
// Tag fetch request
const taggedData = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] },
})

// Revalidate by tag (in Server Action)
'use server'
import { revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  await db.posts.create({ ... })
  revalidateTag('posts', 'max') // Revalidate all requests with 'posts' tag
}
```

---

## Parallel vs Sequential Fetching

### Parallel Fetching (Recommended)

**Use when**: Requests are independent.

```typescript
// ✅ PARALLEL: All requests start simultaneously
export default async function Dashboard() {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json()),
  ])

  return (
    <div>
      <UserInfo user={user} />
      <PostsList posts={posts} />
      <CommentsList comments={comments} />
    </div>
  )
}
```

**Performance**: 3 requests complete in ~500ms (fastest request time).

---

### Sequential Fetching (Use Sparingly)

**Use when**: Request B depends on result from Request A.

```typescript
// ✅ SEQUENTIAL: Only when necessary
export default async function UserPosts({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params

  // Step 1: Fetch user
  const user = await fetch(`/api/users/${userId}`).then(r => r.json())

  // Step 2: Fetch user's posts (depends on user.id)
  const posts = await fetch(`/api/posts?userId=${user.id}`).then(r => r.json())

  return (
    <div>
      <h1>{user.name}'s Posts</h1>
      <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  )
}
```

**Performance**: 2 requests complete in ~1s (sum of both requests).

**⚠️ Warning**: Avoid sequential fetching when parallel is possible (waterfall performance issue).

---

### Avoid Data Fetching Waterfalls

**❌ BAD: Waterfall (each component waits for previous)**:

```typescript
// app/dashboard/page.tsx
export default async function Dashboard() {
  return (
    <div>
      <UserInfo />      {/* Waits 500ms */}
      <PostsList />     {/* Then waits 500ms */}
      <CommentsList />  {/* Then waits 500ms */}
    </div>
  )
}

// Total time: ~1.5s (waterfall)
async function UserInfo() {
  const user = await fetch('/api/user').then(r => r.json())
  return <div>{user.name}</div>
}

async function PostsList() {
  const posts = await fetch('/api/posts').then(r => r.json())
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

**✅ GOOD: Parallel with Promise.all or Suspense**:

```typescript
// Option 1: Promise.all (recommended)
export default async function Dashboard() {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json()),
  ])

  return (
    <div>
      <UserInfo user={user} />
      <PostsList posts={posts} />
      <CommentsList comments={comments} />
    </div>
  )
}

// Option 2: Streaming with Suspense (advanced)
export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <UserInfo />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <PostsList />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <CommentsList />
      </Suspense>
    </div>
  )
}
```

---

## Request Deduplication

**Automatic**: Next.js deduplicates identical `fetch()` requests in the same render pass.

```typescript
// ✅ DEDUPLICATED: Only 1 request to /api/user
export default async function Page() {
  return (
    <div>
      <UserProfile />  {/* fetch('/api/user') */}
      <UserSettings /> {/* fetch('/api/user') - DEDUPLICATED */}
    </div>
  )
}

async function UserProfile() {
  const user = await fetch('/api/user').then(r => r.json())
  return <div>{user.name}</div>
}

async function UserSettings() {
  const user = await fetch('/api/user').then(r => r.json()) // Same request
  return <div>{user.email}</div>
}
```

**How it works**:
- Next.js caches `fetch()` requests during render
- Identical requests (same URL, method, headers) return cached response
- Cache cleared after render completes

**Manual deduplication** (for non-fetch requests):

```typescript
import { cache } from 'react'

// Wrap function with cache()
const getUser = cache(async (userId: string) => {
  const user = await db.users.findUnique({ where: { id: userId } })
  return user
})

// Usage
export default async function Page() {
  return (
    <div>
      <UserProfile />  {/* getUser() called once */}
      <UserSettings /> {/* getUser() - cached */}
    </div>
  )
}

async function UserProfile() {
  const user = await getUser('123') // First call
  return <div>{user.name}</div>
}

async function UserSettings() {
  const user = await getUser('123') // Cached
  return <div>{user.email}</div>
}
```

---

## Streaming with Suspense

**Use Case**: Show UI immediately, stream slow data as it loads.

### Pattern 1: Suspense Boundaries

```typescript
import { Suspense } from 'react'

// Fast component (shows immediately)
async function Header() {
  return <header>My App</header>
}

// Slow component (streams when ready)
async function SlowData() {
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate slow API
  const data = await fetch('/api/slow-data').then(r => r.json())
  return <div>{data.content}</div>
}

// Page streams content
export default function Page() {
  return (
    <div>
      <Header /> {/* Shows immediately */}

      <Suspense fallback={<div>Loading slow data...</div>}>
        <SlowData /> {/* Streams when ready */}
      </Suspense>
    </div>
  )
}
```

**Result**:
1. Header shows immediately
2. Loading fallback shows
3. SlowData streams when ready (2s later)

---

### Pattern 2: Multiple Suspense Boundaries

```typescript
export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Suspense fallback={<Skeleton />}>
        <UserProfile /> {/* Fast */}
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <RecentPosts /> {/* Medium speed */}
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <Analytics /> {/* Slow */}
      </Suspense>
    </div>
  )
}
```

**Result**: Each section streams independently as data loads.

---

### Pattern 3: Nested Suspense

```typescript
export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MainContent>
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
      </MainContent>
    </Suspense>
  )
}
```

---

## Error Handling

### Pattern 1: Error Boundaries

```typescript
// app/error.tsx (catches errors in page)
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

---

### Pattern 2: Try-Catch in Server Components

```typescript
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const product = await fetch(`/api/products/${id}`).then(res => {
      if (!res.ok) throw new Error('Product not found')
      return res.json()
    })

    return <div>{product.name}</div>
  } catch (error) {
    return <div>Error loading product. Please try again.</div>
  }
}
```

---

### Pattern 3: notFound() for 404

```typescript
import { notFound } from 'next/navigation'

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await fetch(`/api/posts/${slug}`).then(r => r.json())

  if (!post) {
    notFound() // Shows app/not-found.tsx
  }

  return <article>{post.content}</article>
}
```

```typescript
// app/not-found.tsx
export default function NotFound() {
  return <h1>404 - Post Not Found</h1>
}
```

---

## Loading States

### Pattern 1: loading.tsx (Route-level)

```typescript
// app/posts/loading.tsx (automatic loading UI)
export default function Loading() {
  return <div>Loading posts...</div>
}

// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await fetch('/api/posts').then(r => r.json())
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

---

### Pattern 2: Suspense Fallback (Component-level)

```typescript
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncComponent />
    </Suspense>
  )
}
```

---

## Data Fetching Libraries

### TanStack Query (React Query)

**Use Case**: Client-side data fetching, caching, synchronization.

```typescript
'use client'
import { useQuery } from '@tanstack/react-query'

export function PostsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(r => r.json()),
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading posts</div>

  return <ul>{data.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

**When to Use**:
- ✅ Client-side data fetching
- ✅ Real-time updates
- ✅ Optimistic updates
- ✅ Complex caching logic

---

### SWR

**Use Case**: Lightweight client-side data fetching.

```typescript
'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading profile</div>

  return <div>{data.name}</div>
}
```

---

## Best Practices

### ✅ DO

1. **Fetch in Server Components by default**
   - Faster, more secure, better SEO

2. **Use parallel fetching when possible**
   - `Promise.all()` for independent requests

3. **Use Suspense for slow data**
   - Show UI immediately, stream data

4. **Fetch data close to where it's used**
   - Component-level ownership, automatic deduplication

5. **Use `"use cache"` for expensive operations**
   - Opt-in caching for performance

6. **Tag fetch requests for revalidation**
   - `next: { tags: ['posts'] }` + `revalidateTag('posts', 'max')`

7. **Handle errors gracefully**
   - error.tsx, try-catch, notFound()

8. **Use loading.tsx or Suspense fallbacks**
   - Better UX during data loading

---

### ❌ DON'T

1. **Don't fetch in Client Components unless necessary**
   - Use Server Components first

2. **Don't create data fetching waterfalls**
   - Use parallel fetching or Suspense

3. **Don't over-fetch data**
   - Fetch only what's needed

4. **Don't ignore error states**
   - Always handle errors

5. **Don't use useEffect for initial data fetching**
   - Use Server Components instead

6. **Don't fetch in layouts for component-specific data**
   - Fetch in component that needs it

7. **Don't skip cache tags for mutable data**
   - Tag for easy revalidation

8. **Don't use `cache: 'no-store'` everywhere**
   - Cache when possible for performance

---

## Quick Reference

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Server Component fetch** | Default data fetching | `await fetch('/api/data')` |
| **Parallel fetching** | Independent requests | `Promise.all([fetch1, fetch2])` |
| **Sequential fetching** | Dependent requests | `await fetch1; await fetch2` |
| **Request deduplication** | Identical requests | Automatic with `fetch()` |
| **Streaming** | Slow data | `<Suspense><Slow /></Suspense>` |
| **Error handling** | API failures | `error.tsx` or try-catch |
| **Loading states** | Data loading | `loading.tsx` or Suspense fallback |
| **Cache control** | Performance | `"use cache"` or `next: { revalidate }` |
| **Tag revalidation** | Data mutations | `revalidateTag('posts', 'max')` |

---

## Resources

- **Next.js Data Fetching Docs**: https://nextjs.org/docs/app/building-your-application/data-fetching
- **TanStack Query**: https://tanstack.com/query/latest
- **SWR**: https://swr.vercel.app
