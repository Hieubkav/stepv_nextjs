# Dashboard Media Module

- Convex schema defines `media` table with `kind`, optional image/video fields, `createdAt`, soft-delete column. Indexes `by_kind` and `by_deleted` used across queries.
- Server layer lives in `packages/backend/convex/media.ts`: upload url action, CRUD mutations (`saveImage`, `createVideo`, `list`, `update`, `remove`, `replaceImage`, `forceRemove`, `getImageUrl`). Image flows always wrap storage delete in try/catch to survive missing blobs.
- Next API routes: `/api/media/upload` and `/api/media/replace` convert incoming files to WebP via `sharp`, push to Convex storage, and call the proper mutations. Each route exports `runtime = "nodejs"` and keeps fallbacks when backend lacks `sizeBytes`.
- Dashboard UI is `apps/web/src/app/(dashboard)/dashboard/media/page.tsx`: uses `useQuery(api.media.list)` for data, offers bulk select, title editing dialog, replace-upload hook to `/api/media/replace`, and `forceRemove` fallback when storage delete fails.
- Global modal wiring: `MediaModalProvider` wraps `(dashboard)` layout. `MediaTopbarActions` exposes trigger button, while `MediaModalMount` renders `<MediaModal>` with tabs for image upload (drag & drop, WebP conversion via API) and video link creation.
- Integration reminder: keep `NEXT_PUBLIC_CONVEX_URL` set, respect `convex_rule.md` before editing backend, and registers new work by running `bunx tsc --project apps/web/tsconfig.json --noEmit`; only execute `bun run --cwd apps/web build` on user request.
