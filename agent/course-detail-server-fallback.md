# Course Detail Server Fallback

## Ngay 2025-10-19
- Trang `/khoa-hoc/[courseSlug]` khong con goi `notFound()` khi Convex tra ve `null`.
- File lien quan: `apps/web/src/app/(site)/khoa-hoc/[courseSlug]/page.tsx`.
- Neu slug khong ton tai hoac khoa hoc bi an, server chi log canh bao va tra ve trang co `CourseDetailScreen`.
- `CourseDetailScreen` se hien `GuestCourseNotFound` (khach) hoac `NoCourseAccess` (hoc vien chua duoc cap quyen), khong gay 404 tu Next.js.
- Metadata tra ve title `"Khoa hoc khong tim thay"` khi khong preload duoc chi tiet.*** End Patch}queued tool apply_patch to=functions.apply_patch code:
