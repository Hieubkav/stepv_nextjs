# Next.js Security Best Practices

**Last Updated**: 2025-11-14
**Source**: Next.js Official Security Guide + OWASP

---

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Data Access Layer (DAL)](#data-access-layer-dal)
3. [Authentication & Authorization](#authentication--authorization)
4. [Input Validation](#input-validation)
5. [Common Vulnerabilities](#common-vulnerabilities)
6. [Server-Only Code](#server-only-code)
7. [Environment Variables](#environment-variables)
8. [API Security](#api-security)
9. [Security Headers](#security-headers)
10. [Best Practices Summary](#best-practices-summary)

---

## Security Architecture

Next.js security model based on **Zero Trust Architecture**:

1. **Server Components** (default) - Secure by default
2. **Client Components** - Explicit opt-in with `'use client'`
3. **Server Actions** - CSRF protection built-in
4. **Data Access Layer** - Centralized authorization

**Key Principle**: Validate and authorize at EVERY layer.

---

## Data Access Layer (DAL)

**Recommended Approach**: Use Data Access Layer for new projects.

### What is DAL?

**Data Access Layer** is a centralized module that:
- ✅ Handles ALL database access
- ✅ Enforces authorization checks
- ✅ Returns minimal Data Transfer Objects (DTOs)
- ✅ Prevents over-fetching
- ✅ Makes security audits easier

---

### DAL Implementation

**File Structure**:
```
lib/
├── dal.ts           # Data Access Layer (server-only)
├── session.ts       # Session management
└── dto.ts           # Data Transfer Objects
```

---

### 1. Session Management

```typescript
// lib/session.ts
'use server'

import { cookies } from 'next/headers'
import { decrypt } from './crypto'

export async function verifySession() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value

  if (!cookie) {
    return null
  }

  const session = await decrypt(cookie)

  if (!session?.userId) {
    return null
  }

  return { userId: session.userId, role: session.role }
}

export async function createSession(userId: string, role: string) {
  const session = await encrypt({ userId, role, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
  const cookieStore = await cookies()

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
```

---

### 2. Data Access Layer

```typescript
// lib/dal.ts
'use server'

import 'server-only'
import { verifySession } from './session'
import { db } from './db'

export async function getUser() {
  const session = await verifySession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      // Don't select password
    },
  })

  return user
}

export async function getUserPosts() {
  const session = await verifySession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  const posts = await db.post.findMany({
    where: { authorId: session.userId },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
    },
  })

  return posts
}

export async function getAdminUsers() {
  const session = await verifySession()

  // Authorization check
  if (session.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  return users
}
```

---

### 3. Data Transfer Objects (DTOs)

```typescript
// lib/dto.ts

export type UserDTO = {
  id: string
  name: string
  email: string
}

export type PostDTO = {
  id: string
  title: string
  content: string
  createdAt: Date
}

// Omit sensitive fields
export function toUserDTO(user: any): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    // password omitted
  }
}
```

---

### 4. Usage in Components

```typescript
// app/dashboard/page.tsx
import { getUser, getUserPosts } from '@/lib/dal'

export default async function DashboardPage() {
  const user = await getUser() // ✅ Authorized in DAL
  const posts = await getUserPosts() // ✅ Authorized in DAL

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

### Benefits of DAL

| Benefit | Explanation |
|---------|-------------|
| **Centralized Authorization** | All auth checks in one place |
| **Easier Audits** | Security team can review single file |
| **Consistent DTOs** | No over-fetching or under-fetching |
| **Type Safety** | TypeScript types for all data access |
| **Reusability** | DAL functions used across components |
| **Server-Only** | Cannot be imported in Client Components |

---

## Authentication & Authorization

### Pattern 1: Authentication in Middleware (proxy.ts)

```typescript
// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from './lib/session'

export async function proxy(request: NextRequest) {
  const session = await verifySession()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Protect authenticated routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
```

---

### Pattern 2: Authorization in Server Components

```typescript
// app/admin/page.tsx
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await verifySession()

  // Authorization check
  if (!session || session.role !== 'admin') {
    redirect('/unauthorized')
  }

  // Admin content
  return <div>Admin Dashboard</div>
}
```

---

### Pattern 3: Authorization in Server Actions

```typescript
// app/actions.ts
'use server'

import { verifySession } from '@/lib/session'

export async function deletePost(postId: string) {
  const session = await verifySession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  // Check if user owns the post
  const post = await db.post.findUnique({ where: { id: postId } })

  if (post.authorId !== session.userId) {
    throw new Error('Forbidden: You can only delete your own posts')
  }

  await db.post.delete({ where: { id: postId } })
}
```

---

### Pattern 4: Authorization in API Routes

```typescript
// app/api/posts/route.ts
import { verifySession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await verifySession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = await db.post.findMany({
    where: { authorId: session.userId },
  })

  return NextResponse.json(posts)
}
```

---

## Input Validation

### Pattern 1: Zod Validation

```typescript
// app/actions.ts
'use server'

import { z } from 'zod'

const CreatePostSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
  tags: z.array(z.string()).max(5),
})

export async function createPost(formData: FormData) {
  // Parse and validate
  const result = CreatePostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    tags: JSON.parse(formData.get('tags') as string),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  // result.data is type-safe and validated
  await db.post.create({ data: result.data })

  return { success: true }
}
```

---

### Pattern 2: Sanitize User Input

```typescript
import DOMPurify from 'isomorphic-dompurify'

export async function createPost(formData: FormData) {
  const rawContent = formData.get('content') as string

  // Sanitize HTML input
  const sanitizedContent = DOMPurify.sanitize(rawContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href'],
  })

  await db.post.create({
    data: {
      title: formData.get('title') as string,
      content: sanitizedContent,
    },
  })
}
```

---

### Pattern 3: Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
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

## Common Vulnerabilities

### 1. SQL Injection (Prevention)

**❌ NEVER concatenate user input into SQL**:
```typescript
// ❌ BAD: SQL Injection vulnerability
const userId = formData.get('userId')
const user = await db.$queryRaw`SELECT * FROM users WHERE id = ${userId}` // Vulnerable!
```

**✅ Use parameterized queries or ORM**:
```typescript
// ✅ GOOD: Parameterized query
const userId = formData.get('userId') as string
const user = await db.user.findUnique({ where: { id: userId } })

// ✅ GOOD: Prisma handles escaping
const users = await db.$queryRaw`SELECT * FROM users WHERE id = ${Prisma.sql`${userId}`}`
```

---

### 2. XSS (Cross-Site Scripting) Prevention

**React escapes by default** (safe):
```typescript
// ✅ SAFE: React escapes automatically
const comment = '<script>alert("XSS")</script>'
return <div>{comment}</div> // Renders as text, not script
```

**❌ AVOID dangerouslySetInnerHTML**:
```typescript
// ❌ DANGEROUS: Can inject scripts
const html = '<script>alert("XSS")</script>'
return <div dangerouslySetInnerHTML={{ __html: html }} />
```

**✅ Sanitize if dangerouslySetInnerHTML required**:
```typescript
import DOMPurify from 'isomorphic-dompurify'

const html = '<script>alert("XSS")</script>'
const sanitized = DOMPurify.sanitize(html)
return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

---

### 3. CSRF (Cross-Site Request Forgery) Prevention

**Next.js Server Actions include CSRF protection by default**.

**For API Routes, add CSRF tokens manually**:
```typescript
import { generateToken, verifyToken } from '@/lib/csrf'

// Generate token
export async function GET() {
  const token = await generateToken()
  return NextResponse.json({ csrfToken: token })
}

// Verify token
export async function POST(request: Request) {
  const token = request.headers.get('x-csrf-token')

  if (!await verifyToken(token)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  // Handle request
}
```

---

### 4. Open Redirect Prevention

**❌ NEVER use user input directly in redirects**:
```typescript
// ❌ BAD: Open redirect vulnerability
const redirectUrl = searchParams.get('redirect')
redirect(redirectUrl) // Can redirect to malicious site
```

**✅ Validate redirect URLs**:
```typescript
// ✅ GOOD: Validate against allowlist
const redirectUrl = searchParams.get('redirect')

const allowedRedirects = ['/dashboard', '/profile', '/settings']

if (!allowedRedirects.includes(redirectUrl)) {
  redirect('/') // Safe default
}

redirect(redirectUrl)
```

---

### 5. Timing Attacks Prevention

**Use constant-time comparison for secrets**:
```typescript
import { timingSafeEqual } from 'crypto'

function verifyToken(token: string, expected: string): boolean {
  // ❌ BAD: Timing attack vulnerable
  if (token === expected) return true

  // ✅ GOOD: Constant-time comparison
  const tokenBuffer = Buffer.from(token)
  const expectedBuffer = Buffer.from(expected)

  if (tokenBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(tokenBuffer, expectedBuffer)
}
```

---

## Server-Only Code

### Pattern 1: `'server-only'` Package

```bash
npm install server-only
```

```typescript
// lib/dal.ts
import 'server-only' // ✅ Prevents import in Client Components

export async function getUser() {
  // Server-only code
}
```

**Error if imported in Client Component**:
```
Error: This module cannot be imported from a Client Component
```

---

### Pattern 2: Separate Server/Client Code

```
lib/
├── server/        # Server-only code
│   ├── dal.ts
│   └── session.ts
└── client/        # Client-safe code
    └── utils.ts
```

---

## Environment Variables

### Best Practices

**✅ DO**:
- Use `NEXT_PUBLIC_` prefix for client-side env vars
- Store secrets in `.env.local` (not `.env`)
- Use secrets management (Vercel, AWS Secrets Manager)
- Validate env vars at startup

**❌ DON'T**:
- Commit `.env.local` to Git
- Prefix secrets with `NEXT_PUBLIC_`
- Hardcode secrets in code
- Use secrets in Client Components

---

### Pattern: Validate Env Vars

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SECRET_KEY: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

```typescript
// Usage
import { env } from '@/lib/env'

const db = new PrismaClient({ datasourceUrl: env.DATABASE_URL })
```

---

## API Security

### Pattern 1: API Key Authentication

```typescript
// app/api/data/route.ts
export async function GET(request: Request) {
  const apiKey = request.headers.get('x-api-key')

  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Handle request
}
```

---

### Pattern 2: JWT Verification

```typescript
import { verify } from 'jsonwebtoken'

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET)
    // Handle request
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
```

---

### Pattern 3: CORS Configuration

```typescript
// next.config.ts
const config = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://allowed-origin.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
```

---

## Security Headers

### Recommended Headers

```typescript
// next.config.ts
const config = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent DNS prefetch attacks
          { key: 'X-DNS-Prefetch-Control', value: 'on' },

          // Force HTTPS
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },

          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

          // XSS protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },

          // Referrer policy
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },

          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.example.com; frame-ancestors 'none';",
          },
        ],
      },
    ]
  },
}
```

---

## Best Practices Summary

### ✅ DO

1. **Use Data Access Layer (DAL)** for new projects
2. **Verify sessions at every layer** (middleware, components, actions, APIs)
3. **Validate all user input** with Zod or similar
4. **Use parameterized queries or ORMs** (never concatenate SQL)
5. **Sanitize HTML** if using `dangerouslySetInnerHTML`
6. **Implement rate limiting** for APIs
7. **Use constant-time comparison** for secrets
8. **Add `'server-only'`** to server-only modules
9. **Validate environment variables** at startup
10. **Configure security headers** (CSP, HSTS, etc.)
11. **Implement CSRF protection** for API routes
12. **Use HTTPS** in production
13. **Audit dependencies** regularly (`npm audit`)
14. **Monitor errors** with Sentry or similar
15. **Log security events** (failed logins, unauthorized access)

---

### ❌ DON'T

1. **Don't concatenate user input into SQL**
2. **Don't use user input directly in redirects**
3. **Don't prefix secrets with `NEXT_PUBLIC_`**
4. **Don't commit `.env.local` to Git**
5. **Don't skip authorization checks**
6. **Don't trust client-side data**
7. **Don't use `dangerouslySetInnerHTML` without sanitization**
8. **Don't expose stack traces in production**
9. **Don't use weak session expiration**
10. **Don't skip rate limiting**

---

## Security Checklist

- [ ] DAL implemented with authorization checks
- [ ] Session management with secure cookies
- [ ] Input validation with Zod
- [ ] SQL injection prevention (ORM or parameterized queries)
- [ ] XSS prevention (sanitize HTML)
- [ ] CSRF protection enabled
- [ ] Open redirect validation
- [ ] Rate limiting configured
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Environment variables validated
- [ ] Server-only code protected with `'server-only'`
- [ ] API authentication implemented
- [ ] Error monitoring configured
- [ ] Dependencies audited (`npm audit`)

---

## Resources

- **Next.js Security Docs**: https://nextjs.org/docs/app/guides/data-security
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Zod**: https://zod.dev
- **DOMPurify**: https://github.com/cure53/DOMPurify
