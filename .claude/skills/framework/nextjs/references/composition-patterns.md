# Next.js Component Composition Patterns

**Last Updated**: 2025-11-14
**Source**: Next.js Official Composition Patterns + React Best Practices

---

## Table of Contents

1. [Server vs Client Components](#server-vs-client-components)
2. [Composition Rules](#composition-rules)
3. [Passing Data Patterns](#passing-data-patterns)
4. [Sharing Data Between Components](#sharing-data-between-components)
5. [Context API Usage](#context-api-usage)
6. [Children Prop Pattern](#children-prop-pattern)
7. [Common Anti-Patterns](#common-anti-patterns)
8. [Best Practices](#best-practices)

---

## Server vs Client Components

### When to Use Server Components (Default)

**Use Server Components for**:
- ✅ Data fetching from APIs/databases
- ✅ Accessing backend resources (files, env vars)
- ✅ Keeping large dependencies on server (reduce bundle)
- ✅ Rendering static content
- ✅ Using Node.js APIs (fs, path, crypto)

**Example**:
```typescript
// app/posts/page.tsx (Server Component - default)
export default async function PostsPage() {
  // Fetch directly in component
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
```

---

### When to Use Client Components

**Use Client Components for**:
- ✅ React hooks (`useState`, `useEffect`, `useContext`)
- ✅ Event handlers (`onClick`, `onChange`, `onSubmit`)
- ✅ Browser APIs (`window`, `localStorage`, `navigator`)
- ✅ Third-party libraries using browser APIs
- ✅ Custom hooks
- ✅ Class components

**Example**:
```typescript
// app/components/search-box.tsx
'use client' // Required for Client Component

import { useState } from 'react'

export function SearchBox() {
  const [query, setQuery] = useState('')

  return (
    <input
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

---

## Composition Rules

### Rule 1: Server Component can import Client Component ✅

```typescript
// app/page.tsx (Server Component)
import { InteractiveButton } from './components/interactive-button' // Client Component

export default async function Page() {
  const data = await fetch('/api/data').then(r => r.json())

  return (
    <div>
      <h1>{data.title}</h1>
      <InteractiveButton /> {/* ✅ Works */}
    </div>
  )
}

// app/components/interactive-button.tsx (Client Component)
'use client'

import { useState } from 'react'

export function InteractiveButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Clicks: {count}</button>
}
```

---

### Rule 2: Client Component can import Client Component ✅

```typescript
// app/components/form.tsx (Client Component)
'use client'

import { Button } from './button' // Client Component

export function Form() {
  return (
    <form>
      <input type="text" />
      <Button /> {/* ✅ Works */}
    </form>
  )
}

// app/components/button.tsx (Client Component)
'use client'

export function Button() {
  return <button>Submit</button>
}
```

---

### Rule 3: Client Component CANNOT directly import Server Component ❌

```typescript
// ❌ WRONG: Client Component importing Server Component
'use client'

import { ServerData } from './server-data' // Server Component

export function ClientWrapper() {
  return <ServerData /> // ❌ ERROR
}
```

**Error**:
```
Error: You're importing a Server Component into a Client Component
```

---

### Rule 4: Client Component CAN receive Server Component as children ✅

**Solution**: Pass Server Component as `children` prop.

```typescript
// ✅ CORRECT: Pass Server Component as children
// app/page.tsx (Server Component)
import { ClientWrapper } from './components/client-wrapper'
import { ServerData } from './components/server-data'

export default function Page() {
  return (
    <ClientWrapper>
      <ServerData /> {/* ✅ Works - passed as children */}
    </ClientWrapper>
  )
}

// app/components/client-wrapper.tsx (Client Component)
'use client'

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <div className="wrapper">{children}</div>
}

// app/components/server-data.tsx (Server Component)
export async function ServerData() {
  const data = await fetch('/api/data').then(r => r.json())
  return <div>{data.content}</div>
}
```

---

## Passing Data Patterns

### Pattern 1: Props (Recommended)

**Pass data via props** - simplest and most common pattern.

```typescript
// app/posts/page.tsx (Server Component)
export default async function PostsPage() {
  const posts = await fetch('/api/posts').then(r => r.json())

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

// app/components/post-card.tsx (Server Component)
type Post = {
  id: string
  title: string
  excerpt: string
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </article>
  )
}
```

---

### Pattern 2: Component-Level Data Fetching (Preferred for Server Components)

**Fetch data in the component that needs it** - enables automatic request deduplication.

```typescript
// app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <div>
      <UserProfile /> {/* Fetches own data */}
      <UserSettings /> {/* Fetches same data - deduplicated */}
    </div>
  )
}

// app/components/user-profile.tsx
async function UserProfile() {
  const user = await fetch('/api/user').then(r => r.json())
  return <div>{user.name}</div>
}

// app/components/user-settings.tsx
async function UserSettings() {
  const user = await fetch('/api/user').then(r => r.json()) // ✅ Deduplicated
  return <div>{user.email}</div>
}
```

**Why this works**: Next.js automatically deduplicates identical `fetch()` requests during render.

---

### Pattern 3: React `cache()` for Non-Fetch Requests

**Use `cache()` to deduplicate non-fetch requests** (e.g., database queries).

```typescript
import { cache } from 'react'

// Wrap function with cache()
const getUser = cache(async (userId: string) => {
  console.log('Fetching user:', userId) // Called only once
  const user = await db.user.findUnique({ where: { id: userId } })
  return user
})

// app/dashboard/page.tsx
export default async function Dashboard() {
  return (
    <div>
      <UserProfile userId="123" /> {/* getUser('123') called */}
      <UserSettings userId="123" /> {/* getUser('123') cached */}
    </div>
  )
}

async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId) // First call
  return <div>{user.name}</div>
}

async function UserSettings({ userId }: { userId: string }) {
  const user = await getUser(userId) // Cached
  return <div>{user.email}</div>
}
```

---

## Sharing Data Between Components

### Option 1: Fetch in Parent, Pass Props (Simple)

```typescript
// app/posts/[id]/page.tsx
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await fetch(`/api/posts/${id}`).then(r => r.json())

  return (
    <div>
      <PostHeader post={post} />
      <PostContent post={post} />
      <PostFooter post={post} />
    </div>
  )
}

function PostHeader({ post }: { post: Post }) {
  return <h1>{post.title}</h1>
}

function PostContent({ post }: { post: Post }) {
  return <div>{post.content}</div>
}

function PostFooter({ post }: { post: Post }) {
  return <p>Published: {post.publishedAt}</p>
}
```

---

### Option 2: Fetch in Each Component (Automatic Deduplication)

```typescript
// app/posts/[id]/page.tsx
export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <PostHeader params={params} />
      <PostContent params={params} />
      <PostFooter params={params} />
    </div>
  )
}

async function PostHeader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await fetch(`/api/posts/${id}`).then(r => r.json()) // Request 1
  return <h1>{post.title}</h1>
}

async function PostContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await fetch(`/api/posts/${id}`).then(r => r.json()) // Request deduplicated
  return <div>{post.content}</div>
}

async function PostFooter({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await fetch(`/api/posts/${id}`).then(r => r.json()) // Request deduplicated
  return <p>Published: {post.publishedAt}</p>
}
```

**Result**: Only 1 API call (Next.js deduplicates identical requests).

---

### Option 3: Context API (Client Components Only)

**Use Context for client-side state sharing**.

```typescript
// app/providers/cart-provider.tsx
'use client'

import { createContext, useContext, useState } from 'react'

const CartContext = createContext<{
  items: string[]
  addItem: (item: string) => void
} | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([])

  const addItem = (item: string) => setItems([...items, item])

  return (
    <CartContext.Provider value={{ items, addItem }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

// Usage
// app/layout.tsx
import { CartProvider } from './providers/cart-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}

// app/components/add-to-cart.tsx
'use client'

import { useCart } from '@/app/providers/cart-provider'

export function AddToCart({ productId }: { productId: string }) {
  const { addItem } = useCart()

  return <button onClick={() => addItem(productId)}>Add to Cart</button>
}
```

---

## Context API Usage

### Best Practice: Separate Providers per Feature

**❌ BAD: Single large context**:
```typescript
// ❌ Don't put everything in one context
const AppContext = createContext({
  user: null,
  cart: [],
  theme: 'light',
  language: 'en',
  // ... too many things
})
```

**✅ GOOD: Separate contexts**:
```typescript
// ✅ Separate contexts per feature
const UserContext = createContext(null)
const CartContext = createContext(null)
const ThemeContext = createContext(null)
```

---

### Pattern: Provider Composition

```typescript
// app/providers/index.tsx
'use client'

import { UserProvider } from './user-provider'
import { CartProvider } from './cart-provider'
import { ThemeProvider } from './theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <CartProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </CartProvider>
    </UserProvider>
  )
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

---

## Children Prop Pattern

### Pattern 1: Layout with Children

```typescript
// app/components/card.tsx (Server Component)
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4">
      {children}
    </div>
  )
}

// Usage
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

---

### Pattern 2: Slots Pattern (Multiple Named Children)

```typescript
// app/components/dashboard-layout.tsx
type DashboardLayoutProps = {
  header: React.ReactNode
  sidebar: React.ReactNode
  main: React.ReactNode
  footer: React.ReactNode
}

export function DashboardLayout({ header, sidebar, main, footer }: DashboardLayoutProps) {
  return (
    <div>
      <header>{header}</header>
      <div className="flex">
        <aside>{sidebar}</aside>
        <main>{main}</main>
      </div>
      <footer>{footer}</footer>
    </div>
  )
}

// Usage
<DashboardLayout
  header={<Header />}
  sidebar={<Sidebar />}
  main={<Content />}
  footer={<Footer />}
/>
```

---

## Common Anti-Patterns

### ❌ Anti-Pattern 1: Props Drilling (Too Deep)

```typescript
// ❌ BAD: Passing props through 5 levels
function App() {
  const user = { name: 'John' }
  return <Level1 user={user} />
}

function Level1({ user }) {
  return <Level2 user={user} />
}

function Level2({ user }) {
  return <Level3 user={user} />
}

function Level3({ user }) {
  return <Level4 user={user} />
}

function Level4({ user }) {
  return <Level5 user={user} />
}

function Level5({ user }) {
  return <div>{user.name}</div> // Finally used here
}
```

**✅ Solution**: Use Context or component composition:
```typescript
// ✅ GOOD: Context for deeply nested data
const UserContext = createContext(null)

function App() {
  const user = { name: 'John' }
  return (
    <UserContext.Provider value={user}>
      <Level1 />
    </UserContext.Provider>
  )
}

function Level5() {
  const user = useContext(UserContext)
  return <div>{user.name}</div>
}
```

---

### ❌ Anti-Pattern 2: Fetching in Layout for Component-Specific Data

```typescript
// ❌ BAD: Fetch everything in layout
export default async function Layout({ children }) {
  const posts = await fetch('/api/posts').then(r => r.json())
  const comments = await fetch('/api/comments').then(r => r.json())
  const users = await fetch('/api/users').then(r => r.json())

  // How to pass to nested components?
  return <div>{children}</div>
}
```

**✅ Solution**: Fetch in component that needs it:
```typescript
// ✅ GOOD: Fetch where needed
async function Posts() {
  const posts = await fetch('/api/posts').then(r => r.json())
  return <ul>{posts.map(p => <li>{p.title}</li>)}</ul>
}

async function Comments() {
  const comments = await fetch('/api/comments').then(r => r.json())
  return <ul>{comments.map(c => <li>{c.text}</li>)}</ul>
}
```

---

### ❌ Anti-Pattern 3: Using Client Component for Everything

```typescript
// ❌ BAD: Making everything a Client Component
'use client'

export default async function Page() {
  const data = await fetch('/api/data').then(r => r.json())
  return <div>{data.content}</div>
}
```

**✅ Solution**: Use Server Component by default, Client only when needed:
```typescript
// ✅ GOOD: Server Component for data fetching
export default async function Page() {
  const data = await fetch('/api/data').then(r => r.json())
  return (
    <div>
      {data.content}
      <InteractiveButton /> {/* Only this is Client Component */}
    </div>
  )
}
```

---

## Best Practices

### ✅ DO

1. **Default to Server Components**
   - Add `'use client'` only when needed

2. **Fetch data where it's used**
   - Component-level data fetching
   - Automatic deduplication

3. **Pass Server Components as children to Client Components**
   - Avoid direct imports

4. **Use Context for client-side global state only**
   - User preferences, theme, cart

5. **Separate providers by feature**
   - UserProvider, CartProvider, ThemeProvider

6. **Use `cache()` for database queries**
   - Deduplication for non-fetch requests

7. **Keep components small and focused**
   - Single Responsibility Principle

8. **Use TypeScript for prop types**
   - Type safety and autocompletion

---

### ❌ DON'T

1. **Don't make everything a Client Component**
   - Use Server Components by default

2. **Don't directly import Server Components in Client Components**
   - Pass as children instead

3. **Don't fetch in layouts for component-specific data**
   - Fetch where needed

4. **Don't drill props too deep**
   - Use Context or composition

5. **Don't create one giant context**
   - Separate by feature

6. **Don't fetch data in useEffect**
   - Use Server Components instead

7. **Don't over-optimize prematurely**
   - Start simple, optimize when needed

---

## Quick Reference

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Props** | Simple data passing | `<Component data={data} />` |
| **Children** | Layout/wrapper components | `<Card>{children}</Card>` |
| **Context** | Client-side global state | `useContext(ThemeContext)` |
| **cache()** | Database query deduplication | `cache(async () => db.query())` |
| **Component-level fetch** | Server Component data fetching | `await fetch()` in component |

---

## Resources

- **Next.js Composition Docs**: https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns
- **React Context**: https://react.dev/learn/passing-data-deeply-with-context
