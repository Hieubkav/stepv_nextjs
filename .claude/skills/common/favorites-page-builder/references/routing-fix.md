# Routing Fix Guide

## Vấn đề

URL pattern `/khoa-hoc/{slug}` gây lỗi "Tham số không hợp lệ".

```
❌ /khoa-hoc/kho%CC%81a%20ho%CC%A3c%20autocad
   Error: Giá trị "kho%CC%81a%20ho%CC%A3c%20autocad" không phải là số hợp lệ
```

## Nguyên nhân

Trang detail `/khoa-hoc/[courseOrder]` yêu cầu **numeric order**, không phải string slug.

```typescript
// Backend: packages/backend/convex/courses.ts
const getCourseDetail = (ctx, { order, slug }) => {
  // ...
  const matched = list.find((item) => item?.order === Number(order)); // ← Chuyển sang number
  // ...
};
```

## Giải pháp

### Course Object Structure

```typescript
interface Course {
  _id: Id<"courses">,
  order: number,        // ← Field dùng cho URL routing (0, 1, 2, ...)
  slug: string,         // ← Field dùng cho content/SEO (khoa-hoc-autocad)
  title: string,
  thumbnailMediaId?: string,
  // ...
}
```

### URL Pattern Đúng

```typescript
// ❌ WRONG - Dùng slug
const detailHref = `/khoa-hoc/${course.slug}`;
// Result: /khoa-hoc/khoa-hoc-autocad → 404 / Invalid

// ✅ RIGHT - Dùng order
const detailHref = `/khoa-hoc/${course.order}`;
// Result: /khoa-hoc/0 → Works!
```

### Trong Favorites Page

```typescript
import type { Route } from 'next';

// Correct link
const detailHref = `/khoa-hoc/${course.order}` as Route;

<Link href={detailHref}>Vào học ngay</Link>
```

### Trong Course List Page (Reference)

```typescript
// apps/web/src/features/learner/pages/course-list-view.tsx line 96
const detailHref = `/khoa-hoc/${course.order}` as Route;
```

## Checklist

- [ ] Course query trả về `order` field
- [ ] URL href sử dụng `${course.order}`
- [ ] Route parameter nhận numeric value
- [ ] Test: Click card → `/khoa-hoc/0` hoặc `/khoa-hoc/1`
