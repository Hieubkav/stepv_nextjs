# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**QUAN TRỌNG: Trả lời tôi bằng tiếng Việt cho tất cả các tương tác.**

## Quick Start

**Install dependencies:**
```bash
bun install
```

**Setup Convex backend:**
```bash
bun dev:setup
```

**Start all development servers:**
```bash
bun dev
```

**Access the application:** http://localhost:3001

## Available Commands

### Development
- `bun dev` - Start all applications (web + backend)
- `bun dev:web` - Start only the Next.js frontend
- `bun dev:server` - Start only the Convex backend
- `bun dev:setup` - Initial Convex setup and configuration

### Building & Testing
- `bun build` - Build all applications for production
- `bun check-types` - Run TypeScript type checking across all packages
- `bun check` - Run oxlint static analysis

## Project Structure & Architecture

### Monorepo Organization

This is a **Turborepo-based monorepo** with Bun package manager (v1.2.19):

```
dohy/ (root)
├── apps/web                    # Next.js 15 frontend application
├── packages/backend            # Convex BaaS backend
└── package.json               # Root workspace config
```

### Key Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 15.5.0 |
| Runtime | React | 19.0.0 |
| Language | TypeScript | 5.x |
| Build | Turbo | 2.5.6 |
| Package Manager | Bun | 1.2.19 |
| Styling | TailwindCSS | 4.x |
| UI Components | shadcn/ui + Radix UI | Latest |
| Backend | Convex | 1.27.3 |
| Rich Text Editor | Lexical, Tiptap | 0.38.2, 3.10.7 |
| Forms | TanStack React Form, React JSON Schema Form | 1.12.3, 5.19.1 |

### Frontend Architecture (apps/web)

**Page Structure (Next.js App Router):**
```
apps/web/src/app/
├── (admin)/              # Admin dashboard routes
├── (dashboard)/          # Student dashboard routes
├── (learner)/            # Learner-facing routes
│   └── khoa-hoc/        # Courses with dynamic routing
│       ├── [courseOrder]/
│       ├── dang-nhap/   (login)
│       ├── dang-ky/     (register)
│       ├── forgot-password/
│       ├── reset-password/
│       └── yeu-thich/   (favorites)
├── (site)/              # Public website pages
├── api/                 # Next.js API routes
├── docs/                # Documentation
└── todos/               # Demo section
```

**Code Organization:**
- `src/app/` - Page routes and layouts
- `src/components/` - Reusable UI components
  - `ui/` - Base components (shadcn/ui)
  - `layout/` - Layout components
  - `sections/` - Page sections
  - `blocks/` - CMS-style block components
  - `media/` - Image/video components
  - `analytics/` - Analytics components
- `src/features/` - Feature modules (learner, library)
  - `{feature}/auth/` - Authentication context
  - `{feature}/pages/` - Feature-specific pages
  - `{feature}/components/` - Feature components
  - `{feature}/hooks/` - Feature hooks
- `src/context/` - Global React contexts
- `src/hooks/` - Custom hooks
- `src/lib/` - Utility functions and libraries
- `src/types/` - TypeScript type definitions

**Key Contexts (Global State):**
- `LayoutProvider` - Layout state and navigation
- `ThemeProvider` - Theme switching (light/dark mode)
- `SearchProvider` - Search functionality
- `MediaModalProvider` - Media preview modal
- `SiteLayoutDataProvider` - Site configuration and static data

**Authentication Pattern:**
The `student-auth-context.tsx` manages learner authentication with:
- Session-based authentication using localStorage
- "Remember me" token functionality
- Real-time profile updates via Convex subscriptions
- Password reset token management
- Profile watcher component for reactive updates

### Backend Architecture (packages/backend)

**Convex Functions Organization:**
```
packages/backend/convex/
├── schema.ts              # Database schema (13+ tables)
├── students.ts            # Student auth & management
├── courses.ts             # Course/chapter/lesson CRUD
├── course_favorites.ts    # Favorite courses system
├── library.ts             # Resources & tutorials
├── pages.ts               # CMS pages
├── pageBlocks.ts          # Dynamic page block rendering
├── media.ts               # File upload & storage
├── email.ts               # Email notifications
├── visitors.ts            # Analytics tracking
├── homepage.ts            # Homepage data queries
├── settings.ts            # Site configuration
├── todos.ts               # Demo todos
├── healthCheck.ts         # Health checks
├── seed.ts                # Database seeding
└── _generated/            # Auto-generated types
    ├── api.d.ts           # Type-safe API references
    ├── server.d.ts        # Server context types
    └── dataModel.d.ts     # Database model types
```

**Core Database Tables:**

| Category | Tables |
|----------|--------|
| **Auth/Users** | `students`, `course_enrollments`, `course_favorites` |
| **Content** | `courses`, `course_chapters`, `course_lessons`, `library_resources`, `library_softwares` |
| **Media** | `media`, `library_resource_images` |
| **CMS** | `pages`, `page_blocks` |
| **Analytics** | `visitors`, `visitor_sessions`, `visitor_events` |
| **Config** | `settings` |
| **Demo** | `todos` |

### Frontend-Backend Communication

**Integration Pattern: Convex React SDK**

The client communicates with Convex through type-safe hooks and mutation functions:

```typescript
// Real-time queries (subscriptions)
const student = useQuery(api.students.getProfile, { id })

// Mutations (write operations)
const updateProfile = useMutation(api.students.updateProfile)
const result = await updateProfile({ name: "New Name" })

// Imperative queries (from client-side)
const profile = await convex.query(api.students.getProfile, { id })
```

**Key Features:**
- **Type Safety**: Auto-generated `api` object from Convex schema
- **Real-time**: All queries automatically push updates to connected clients
- **Loading States**: Built-in `isLoading` during async operations
- **Error Handling**: Errors passed through hook results
- **Offline Support**: Some data persisted to localStorage

**Environment Variables:**
- `NEXT_PUBLIC_CONVEX_URL` - Public Convex deployment URL (prefixed with NEXT_PUBLIC for client access)
- `CONVEX_URL` - Internal Convex URL (backend only)

### Code Conventions

**Routing & URLs:**
- Routes use slug-based URLs (e.g., `/khoa-hoc/[courseOrder]` where courseOrder is the slug)
- Dynamic segments wrapped in brackets: `[paramName]`
- Route groups use parentheses: `(groupName)`

**Database Conventions:**
- **Soft Deletes**: Use `deletedAt` timestamp instead of hard deletes; always filter in queries
- **Ordering**: Tables include `order` integer field for custom sorting
- **Status**: Boolean `active` field for visibility control
- **Indexing**: Queries use indexes like `by_slug`, `by_active_order`, `by_user_and_active`

**Component Naming:**
- Page components: PascalCase in `pages/` or directly in `app/`
- UI components: PascalCase in `components/ui/`
- Feature components: PascalCase in `features/*/components/`
- Hooks: camelCase starting with `use` in `hooks/` or `features/*/hooks/`

**TypeScript:**
- Strict mode enabled
- No implicit any
- Use generated types from Convex: `api` object for function references, database model types
- Path aliases: `@/*` → `src/*`, `@/.source` → `./.source/index.ts`

## Common Development Tasks

### Adding a New Page
1. Create file in `apps/web/src/app/(group)/path/page.tsx`
2. Export default React component
3. Use existing contexts if needed (ThemeProvider, LayoutProvider, etc.)
4. Convex queries auto-subscribe to data changes

### Adding a Backend Function
1. Create new file in `packages/backend/convex/` or add to existing module
2. Define `query()`, `mutation()`, or `action()` functions
3. Use generated `api` types in frontend
4. Run `bun dev` to regenerate types

### Adding a Database Table
1. Update `packages/backend/convex/schema.ts`
2. Add table definition with fields and indexes
3. Run `bun dev:server` to sync schema
4. Create CRUD functions in corresponding module
5. Types auto-generate in `_generated/`

### Styling Components
- Use TailwindCSS utility classes for styling
- shadcn/ui components pre-styled; customize with Tailwind
- Dark mode: Use `dark:` prefix (theme context handles class switching)
- Custom styles in `src/index.css` if needed

### Working with Forms
- Use `TanStack React Form` for complex forms with validation
- Use `React JSON Schema Form` for dynamic schema-based forms
- Use Zod for schema definition and validation

### Rich Text Editing
- **Lexical**: Complex documents, better stability, less features
- **Tiptap**: More extensions, more flexible, lighter weight
- Both available; choose based on use case

## Development Notes

### Type Checking
- Always run `bun check-types` before committing
- TypeScript strict mode is enabled
- Generated Convex types in `api.d.ts` - never edit manually

### Database Safety
- Soft deletes are the standard pattern
- Always include `!doc.deletedAt` in query filters
- Use `by_active_order` indexes for efficient pagination

### Performance Considerations
- Next.js with Turbopack for faster builds
- React 19 with Server Components support
- Convex handles real-time subscriptions efficiently
- Images optimized with Sharp and Next.js Image component

### Debugging Convex
- Check browser DevTools Network tab for Convex API calls
- Convex Dashboard shows all function calls and database state
- Use `console.log` in backend functions (visible in Convex logs)
- Run `bun dev:server` separately to see backend logs

## Notes for Future Claude Instances

- This project uses Convex as a Backend-as-a-Service—there's no separate database to manage or migrations to run
- The monorepo uses Bun, not npm/yarn—always use `bun` commands
- Component library is shadcn/ui (Radix UI + TailwindCSS)—pre-built, re-exported in `src/components/ui/`
- Rich text editing uses both Lexical and Tiptap; understand which is used in specific features before editing
- Authentication is session-based in localStorage with Convex backend validation
- All styling is TailwindCSS v4 with PostCSS; no CSS modules or CSS-in-JS
- Real-time updates are automatic through Convex subscriptions; don't implement manual polling
