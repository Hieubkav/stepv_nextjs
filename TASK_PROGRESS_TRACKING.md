# Task: Xây dựng Chức năng Quản lý Tiến độ Học tập

## 📋 Mô tả

Thêm chức năng cho học viên có thể **track tiến độ học tập** bằng cách **tick checkbox** bên cạnh mỗi bài học. Admin có thể xem tiến độ % của từng học viên.

## 🎯 Yêu cầu

### Phía Học viên (Trang chi tiết khóa học)

**Trường hợp 1: Chưa login hoặc chưa mua khóa**
- Học viên có thể **click bài công khai (isPreview=true)** để xem video
- Bài không công khai (isPreview=false) → **hiển thị lock icon 🔒**, **không thể click**
- **KHÔNG hiển thị** checkbox, thanh tiến độ

**Trường hợp 2: Đã login AND đã mua khóa học**
- Học viên có thể **click bất kỳ bài nào** để xem video
- **Hiển thị checkbox** bên cạnh mỗi bài học
- Học viên có thể **tick checkbox** để đánh dấu bài đã hoàn thành
- **Hiển thị thanh tiến độ**: "Tiến độ học tập: X%"
- Thanh tiến độ được **tính từ số bài đã tick / tổng số bài**

### Phía Admin - Trang Quản lý Khóa học
- URL: `http://localhost:3000/dashboard/courses/[courseId]/edit` → Tab "Học viên"
- Hiển thị danh sách học viên đã đăng ký
- Mỗi học viên có **thanh tiến độ** với **% hoàn thành**

### Phía Admin - Trang Quản lý Học viên
- URL: `http://localhost:3000/dashboard/students/[studentId]/edit` → Tab "Khóa học"
- Hiển thị danh sách khóa học học viên đã đăng ký
- Mỗi khóa học có **thanh tiến độ** với **% hoàn thành**

## 🔧 Kỹ thuật

### 1. Backend (Convex)
**File: `packages/backend/convex/progress.ts`**

Thêm 2 mutations mới:
```typescript
export const markLessonComplete = mutation({
  args: {
    studentId: v.id("students"),
    lessonId: v.id("course_lessons"),
    courseId: v.id("courses"),
  },
  // Logic: Tạo/update lesson_completions record với isCompleted=true
  // Sau đó call updateEnrollmentProgress để recalc %
})

export const unmarkLessonComplete = mutation({
  args: {
    studentId: v.id("students"),
    lessonId: v.id("course_lessons"),
    courseId: v.id("courses"),
  },
  // Logic: Update lesson_completions record với isCompleted=false
  // Sau đó call updateEnrollmentProgress để recalc %
})
```

**Update `getEnrollmentProgress` query ở `progress.ts`:**
- Thay đổi arg từ `userId: v.string()` → `studentId: v.id("students")`
- Trả về `chaptersProgress` object với structure:
  ```typescript
  chaptersProgress: [{
    chapterId, title, totalLessons, completedLessons, percentage,
    lessons: [{ lessonId, title, isCompleted }, ...]
  }, ...]
  ```
- Trả về `completionPercentage: number` (0-100)

### 2. Frontend - Trang Chi tiết Khóa học

**File: `apps/web/src/app/(learner)/khoa-hoc/[slug]/components/course-curriculum.tsx`**

Cập nhật `CourseCurriculum` component:
- Thêm props: `completionPercentage`, `chaptersProgress`, `onToggleLessonComplete`, `student`, `hasFullAccess`
- **Chỉ hiển thị thanh tiến độ** khi: `hasFullAccess === true && completionPercentage !== undefined`
- Cập nhật `CurriculumLessonRow`:
  - **Checkbox**: Chỉ hiển thị khi `showCompleteCheckbox=true` (tức học viên đã mua)
  - **Lock icon**: Hiển thị khi bài không công khai (`!lesson.isPreview`) AND chưa mua (`!showCompleteCheckbox`)
  - **Click bài**: 
    - Nếu công khai (`lesson.isPreview=true`) → call `onSelect` xem video
    - Nếu đã mua (`showCompleteCheckbox=true`) → call `onSelect` xem video
    - Nếu chưa mua và không công khai → **disabled**, không thể click
  - **Tick checkbox**: Call `onToggleLessonComplete` → mark/unmark hoàn thành

**File: `apps/web/src/app/(learner)/khoa-hoc/[slug]/components/course-detail-client.tsx`**

Cập nhật `CourseDetailClient` component:
- Import `useMutation`
- Thêm: `markLessonComplete = useMutation(api.progress.markLessonComplete)`
- Thêm: `unmarkLessonComplete = useMutation(api.progress.unmarkLessonComplete)`
- Thêm `handleToggleLessonComplete` function để xử lý toggle checkbox
- **Điều kiện hiển thị checkbox/progress:**
  - `hasFullAccess = Boolean(student && enrollment?.exists && enrollment?.active)`
  - Nếu `hasFullAccess === true` → pass `showCompleteCheckbox={true}` tới `CourseCurriculum`
  - Nếu `hasFullAccess === false` → pass `showCompleteCheckbox={false}` (hoặc không truyền)
- Pass các props mới tới `<CourseCurriculum>`: `completionPercentage`, `chaptersProgress`, `onToggleLessonComplete`, `student`, `hasFullAccess`

### 3. Admin - Trang Quản lý Khóa học

**File: `apps/web/src/app/(dashboard)/dashboard/courses/[courseId]/edit/page.tsx`**

Cập nhật khu vực hiển thị học viên:
- Thêm `completionPercentage?` field vào type `EnrollmentDoc`
- Thêm thanh tiến độ trong enrollment item:
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

### 4. Admin - Trang Quản lý Học viên

**File: `apps/web/src/app/(dashboard)/dashboard/students/[studentId]/edit/page.tsx`**

Cập nhật khu vực hiển thị khóa học của học viên:
- Thêm `completionPercentage?` field vào type `EnrollmentDoc`
- Thêm thanh tiến độ tương tự như trên

## 📊 Database

Schema đã có `lesson_completions` table:
```typescript
lesson_completions: defineTable({
  studentId: v.id("students"),
  lessonId: v.id("course_lessons"),
  courseId: v.id("courses"),
  isCompleted: v.boolean(),
  completedAt: v.optional(v.number()),
  // ...
})
```