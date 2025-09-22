# Course Schema Notes

- Tables: courses, course_chapters, course_lessons, course_enrollments.
- Every table keeps `order` for sorting and `active` for toggling visibility.
- `courses` uses `slug` as natural key and references `media` for thumbnail reuse.
- `course_lessons` stores YouTube URL directly to follow KISS video hosting.
- `course_enrollments` keeps optional progress and last viewed lesson to track learning state.

## Backend functions

- `packages/backend/convex/courses.ts` gom cac query/mutation CRUD cho courses, chapters, lessons, enrollments theo chuan KISS.
- Helper dam bao slug unique, validate quan he course-chapter-lesson, clamp progress trong khoang 0-100.
- Khi reorder nho dung cac ham `reorderCourses`, `reorderChapters`, `reorderLessons` de giu thu tu lien tuc.

## Dashboard SAP

- `apps/web/src/app/(dashboard)/dashboard/courses` gom trang list, tao moi va trang quan ly chi tiet (chapters/lessons/enrollments).
- Form chia thanh component rieng (`course-form`, `chapter-form`, `lesson-form`) de tai su dung va giu KISS.
- Cac thao tac reorder dung swap order bang mutation update cho nhanh, sau nay co the doi sang drag&drop neu can.
- Topnav + sidebar da bo sung link "Khoa hoc" va "Hoc vien" de truy cap nhanh trong dashboard.
- `students` table (account/password plain text + contact info) giu thong tin hoc vien (fullName/email/phone/tags) kem order/active + index by_account.
- Passwords luu plain-text de KISS nen admin tu bao mat.
- Dashboard `/dashboard/students` reuse StudentForm cho list/new/edit, bao gom toggle active, swap order, delete (xoa enrollment lien quan).
- Trang course edit cho phep chon hoc vien va bai hoc tu dropdown khi gan enrollment (khong phai nhap ID thu cong).
- Courses co `pricingType` (free/paid) + `priceAmount`/`priceNote`/`isPriceVisible` va lesson co `exerciseLink` de quan ly bai tap download.
