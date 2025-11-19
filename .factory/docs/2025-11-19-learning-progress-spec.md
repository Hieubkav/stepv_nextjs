## Spec: Xây dựng Chức năng Quản lý Tiến độ Học tập

### Tóm tắt
Triển khai hệ thống theo dõi tiến độ học tập cho học viên (tick checkbox để đánh dấu bài hoàn thành, hiển thị % tiến độ) và giao diện admin để xem tiến độ của từng học viên trên từng khóa học.

---

### 1. Backend Changes - Convex (`packages/backend/convex/progress.ts`)

**Cập nhật 2 mutations:**
- `markLessonComplete(studentId, lessonId, courseId)` → Tạo/update `lesson_completions` với `isCompleted=true`
- `unmarkLessonComplete(studentId, lessonId, courseId)` → Update `lesson_completions` với `isCompleted=false`
- Gọi `updateEnrollmentProgress()` để tính lại % tiến độ

**Cập nhật query `getEnrollmentProgress(courseId, studentId)`:**
- Hiện có cấu trúc trả về `chaptersProgress[]` với lessons details
- Đảm bảo trả về `completionPercentage: number` (0-100) tính từ số bài đã tick / tổng số bài

---

### 2. Frontend - Trang Chi tiết Khóa học

**File: `apps/web/src/app/(learner)/khoa-hoc/[slug]/components/course-curriculum.tsx`**
- Thêm props: `completionPercentage?`, `chaptersProgress?`, `onToggleLessonComplete?`, `hasFullAccess`
- Chỉ hiển thị thanh tiến độ "Tiến độ học tập: X%" khi: `hasFullAccess && completionPercentage !== undefined`
- Cập nhật `CurriculumLessonRow`:
  - Checkbox: hiển thị chỉ khi `hasFullAccess=true`
  - Lock icon 🔒: hiển thị khi `!lesson.isPreview && !hasFullAccess`
  - Click bài: disabled nếu chưa mua và không công khai, ngược lại gọi `onLessonSelect`
  - Tick checkbox: gọi `onToggleLessonComplete`

**File: `apps/web/src/app/(learner)/khoa-hoc/[slug]/components/course-detail-client.tsx`**
- Import `useMutation` từ convex/react
- Thêm: `markLessonComplete = useMutation(api.progress.markLessonComplete)`
- Thêm: `unmarkLessonComplete = useMutation(api.progress.unmarkLessonComplete)`
- Thêm `handleToggleLessonComplete(lessonId, isChecked)` → call mutations
- Compute `hasFullAccess = Boolean(student && enrollment?.exists && enrollment?.active)`
- Query: `getEnrollmentProgress` để lấy `completionPercentage` và `chaptersProgress`
- Pass props tới `<CourseCurriculum>`: `completionPercentage`, `chaptersProgress`, `onToggleLessonComplete`, `hasFullAccess`

---

### 3. Admin - Trang Quản lý Khóa học

**File: `apps/web/src/app/(dashboard)/dashboard/courses/[courseId]/edit/page.tsx`**
- Tab "Học viên": thêm `completionPercentage?` field vào type `EnrollmentDoc`
- Khi hiển thị học viên trong danh sách, add thanh tiến độ:
   ```tsx
   {enrollment.completionPercentage !== undefined && (
     <div className="space-y-2">
       <div className="flex items-center justify-between text-sm">
         <span>Tiến độ học</span>
         <span>{enrollment.completionPercentage}%</span>
       </div>
       <div className="w-full bg-muted rounded-full h-2">
         <div
           className="bg-emerald-500 h-2 rounded-full"
           style={{ width: `${enrollment.completionPercentage}%` }}
         />
       </div>
     </div>
   )}
   ```
- Query để lấy enrollment progress của từng học viên

---

### 4. Admin - Trang Quản lý Học viên

**File: `apps/web/src/app/(dashboard)/dashboard/students/[studentId]/edit/page.tsx`**
- Tab "Khóa học": thêm `completionPercentage?` field vào type `EnrollmentDoc`
- Khi hiển thị khóa học của học viên, add thanh tiến độ tương tự phần 3
- Query để lấy enrollment progress của từng khóa học

---

### 5. Testing Plan
- Test trang chi tiết khóa học:
  - ✅ Chưa login: không hiển thị checkbox, chỉ public lessons clickable
  - ✅ Đã login + mua khóa: checkbox visible, có thanh tiến độ, tick/untick hoạt động
  - ✅ Thanh tiến độ cập nhật real-time khi tick/untick
- Test admin pages:
  - ✅ Tab "Học viên" của khóa học: hiển thị % tiến độ cho mỗi học viên
  - ✅ Tab "Khóa học" của học viên: hiển thị % tiến độ cho mỗi khóa học
- Run: `bun check-types` và `bun check` trước commit

---

### 6. Cấu trúc File Thay đổi
```
packages/backend/convex/
├── progress.ts [UPDATE] - Thêm 2 mutations, update query

apps/web/src/app/(learner)/khoa-hoc/[slug]/components/
├── course-curriculum.tsx [UPDATE] - Thêm props, checkbox, lock icon, progress bar
├── course-detail-client.tsx [UPDATE] - Thêm mutation handlers, progress query

apps/web/src/app/(dashboard)/dashboard/
├── courses/[courseId]/edit/page.tsx [UPDATE] - Tab "Học viên" + progress bar
├── students/[studentId]/edit/page.tsx [UPDATE] - Tab "Khóa học" + progress bar
```
