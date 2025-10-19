# Course detail page

## 19/10/2025 - UI refresh for `/khoa-hoc/[order]`

- Replaced the old JSON debug screen with a full hero + sidebar pricing layout in `apps/web/src/app/(site)/khoa-hoc/[courseOrder]/page.tsx` to match the mockup background gradients.
- Server loader now normalizes Convex responses into `course`, `chapters`, `totals`, `thumbnail` and status flags so the component can render friendly error states while keeping a collapsible debug payload.
- Tôn trọng chế độ preview: query string `?preview=1` giữ nguyên lesson/chapters inactive, hiển thị badge “Preview”, còn truy cập thường lọc nội dung ẩn và báo lỗi riêng nếu khóa học đang bị tắt.
- Bổ sung tính toán thống kê (số chương, bài, tổng thời lượng, bài học xem thử) để nuôi các bullet trong sidebar và summary của accordions.
- Khi thiếu `CONVEX_URL`, khóa học không tồn tại, hoặc detail rỗng, trang trả về layout lỗi thống nhất với breadcrumb quay lại danh sách.
- Vibe màu bám theo trang danh sách `/khoa-hoc`: nền #05070f với ba radial vàng nhạt, section/card border trắng/12 và điểm nhấn gradient vàng (#f6e05e → #f0b429).

- Added the route `apps/web/src/app/(site)/khoa-hoc/[courseSlug]/page.tsx` to render `CourseDetailScreen`.
- Prefetches public course detail from Convex on the server with `ConvexHttpClient`; uses `cache` so metadata and page reuse one request.
- Guards missing or inactive course by calling `notFound()` when Convex returns `null`.
- Metadata now reflects course title, optional subtitle or description; fallback title is plain "Khoa hoc".
- Keep the fallback text in Suspense lightweight because the client screen already shows a richer skeleton.
- Remember to ensure `CONVEX_URL` is set in env when testing the page locally; without it the screen still renders but SSR fallback logs a warning.
- Slug lookup now accepts NFC/NFD variations and an ASCII-normalized fallback (see `uniqueSlugCandidates`), scans all courses with `normalizeCourseSlug` if indexed lookups fail, and the page redirects to `detail.course.slug` when the incoming slug differs so bookmarking stays canonical.
- Dashboard edit view adds a quick link button (`apps/web/src/app/(dashboard)/dashboard/courses/[courseId]/edit/page.tsx`) to open the public `/khoa-hoc/${slug}` page in a new tab-handy for manual QA after edits.
- Preview mode: append `?preview=1` to the course URL to load inactive courses (server + client queries pass `includeInactive`), keep the canonical redirect stable, and show an amber banner so editors know they're looking at hidden content.
