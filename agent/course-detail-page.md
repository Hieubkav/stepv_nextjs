# Course detail page

- Added the route `apps/web/src/app/(site)/khoa-hoc/[courseSlug]/page.tsx` to render `CourseDetailScreen`.
- Prefetches public course detail from Convex on the server with `ConvexHttpClient`; uses `cache` so metadata and page reuse one request.
- Guards missing or inactive course by calling `notFound()` when Convex returns `null`.
- Metadata now reflects course title, optional subtitle or description; fallback title is plain "Khoa hoc".
- Keep the fallback text in Suspense lightweight because the client screen already shows a richer skeleton.
- Remember to ensure `CONVEX_URL` is set in env when testing the page locally; without it the screen still renders but SSR fallback logs a warning.
- Slug lookup now accepts NFC/NFD variations and an ASCII-normalized fallback (see `uniqueSlugCandidates`), scans all courses with `normalizeCourseSlug` if indexed lookups fail, and the page redirects to `detail.course.slug` when the incoming slug differs so bookmarking stays canonical.
- Dashboard edit view adds a quick link button (`apps/web/src/app/(dashboard)/dashboard/courses/[courseId]/edit/page.tsx`) to open the public `/khoa-hoc/${slug}` page in a new tab-handy for manual QA after edits.
- Preview mode: append `?preview=1` to the course URL to load inactive courses (server + client queries pass `includeInactive`), keep the canonical redirect stable, and show an amber banner so editors know they're looking at hidden content.
