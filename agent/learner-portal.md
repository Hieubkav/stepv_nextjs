# Learner Portal Notes

- Module `/khoa-hoc` su dung `StudentAuthProvider` (context moi tai `features/learner/auth`) de quan ly session hoc vien luu trong localStorage.
- Backend:
  - `students.authenticateStudent` (mutation) tra ve thong tin hoc vien dang active, khong tra password.
  - `courses.listLearnerCourses`, `courses.getLearnerCourseDetail`, `courses.recordLessonProgress` su dung helper `collectCourseStructure` de tra ve chuong/bai va tinh tien do.
- Frontend screens:
  - `CourseOverviewScreen` goi `listLearnerCourses` (skip bang `'skip'`) de hien thi danh sach khoa hoc + tien do, nut dang xuat, CTA tiep tuc hoc.
  - `CourseDetailScreen` su dung `getLearnerCourseDetail` de render chuong/bai, highlight bai sap hoc, tao URL bang `UrlObject` thay vi template string de thoa typed routes.
  - `LessonPlayerScreen` tu dong goi `recordLessonProgress` khi vao bai hoc va cung cap dieu huong truoc/sau.
- Luu y: dung `'skip' as const` khi `useQuery` can bo qua; Link (`next/link`) voi duong dan dong se dung `UrlObject` (pathname + query) de tranh loi typed routes.
- Badge/UI chi ho tro variant `default|outline`; dung `className` neu can style them.
- Sau khi dang nhap, tien do cap nhat realtime nho `recordLessonProgress` -> `listLearnerCourses` (Convex reactive).
