---
name: favorites-page-builder
description: Tạo trang danh sách yêu thích (wishlist/favorites) với grid layout giống trang chính, card design, image loading, pricing, buttons. Dùng khi cần list page với Convex data + image redirect API + routing fix. Triggers: "favorites page", "wishlist", "yêu thích", "list page giống trang chính"
---

# Favorites Page Builder

## Level 1: Overview

Skill giúp tạo trang danh sách yêu thích/wishlist cho ứng dụng học trực tuyến. Trang này hiển thị các khóa học mà người dùng đã lưu vào yêu thích, với thiết kế giống y hệt trang danh sách khóa học chính.

### Vấn đề giải quyết

1. **Lỗi routing**: `/api/media/{slug}` pattern gây 404 → Fix bằng `/api/media/{id}` endpoint
2. **Ảnh không load**: Favorites page dùng client-side query → Cần API redirect
3. **Card design inconsistency**: Favorites page card khác trang chính → Copy thiết kế giống hệt
4. **Convex data structure**: Course object cần `order` field cho routing, không phải `slug`

### Output

- ✅ Trang yêu thích hoàn chỉnh (`/khoa-hoc/yeu-thich`)
- ✅ API endpoint để load ảnh từ Convex storage (`/api/media/[id]`)
- ✅ Card design identical với trang chính
- ✅ State management cho loading/empty states
- ✅ Routing fix sử dụng `course.order` thay vì `course.slug`

### Yêu cầu

- Convex backend setup (courses, course_favorites, media)
- Student auth context
- CourseFavoriteButton component
- TailwindCSS styling

---

## Level 2: Quick Start

### Bước 1: Fix routing - Hiểu Course Structure

```typescript
// Course object có fields:
{
  _id: "...",
  order: 0,        // ← Dùng field này cho URL, không phải slug
  slug: "khoa-hoc-autocad",
  title: "Khóa học AutoCAD",
  thumbnailMediaId: "media_xyz",
  pricingType: "free" | "paid",
  priceAmount: 299000,
  // ... other fields
}

// URL pattern: /khoa-hoc/{course.order}
// ❌ WRONG: `/khoa-hoc/${course.slug}` → /khoa-hoc/khoa-hoc-autocad
// ✅ RIGHT: `/khoa-hoc/${course.order}` → /khoa-hoc/0
```

### Bước 2: Tạo API Endpoint cho Image Loading

**File:** `apps/web/src/app/api/media/[id]/route.ts`

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export async function GET(request: Request, { params }: { params: any }) {
  const id = params.id;

  try {
    if (!convexUrl) {
      return new Response("Convex URL not configured", { status: 500 });
    }

    const client = new ConvexHttpClient(convexUrl);

    // Get all media and find by ID
    const media = await client.query(api.media.list, { kind: "image" });
    const mediaRecord = media.find((m: any) => m._id === id);

    if (!mediaRecord) {
      return new Response("Image not found", { status: 404 });
    }

    // Use URL from list query if available
    if (mediaRecord.url) {
      return Response.redirect(mediaRecord.url, 307);
    }

    // Otherwise use getImageUrl action
    if (!mediaRecord.storageId) {
      return new Response("Image storage not found", { status: 404 });
    }

    const result = await client.action(api.media.getImageUrl, {
      storageId: mediaRecord.storageId as any,
    });

    if (!result?.url) {
      return new Response("Could not generate image URL", { status: 404 });
    }

    return Response.redirect(result.url, 307);
  } catch (error) {
    console.error("Error fetching image URL:", error);
    return new Response("Error fetching image", { status: 500 });
  }
}
```

### Bước 3: Tạo Favorites Page Component

**File:** `apps/web/src/app/(learner)/khoa-hoc/yeu-thich/page.tsx`

- Client component ('use client')
- Query: `api.course_favorites.listStudentFavorites`
- States: not-logged-in, loading, empty, with-data
- Grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Card structure: image + content + buttons (identical to main courses page)

### Bước 4: Copy Card Design từ Main Courses Page

Sử dụng cùng CSS classes & structure:
```tsx
// From course-list-view.tsx
<article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300">
  <div className="relative aspect-video overflow-hidden bg-slate-100">
    {/* image with onError handler */}
  </div>
  <div className="flex flex-1 flex-col gap-3 p-4">
    {/* title, subtitle, price */}
  </div>
  <div className="space-y-2 border-t border-slate-100 px-4 py-3">
    {/* "Vào học ngay" + "Xem chi tiết" buttons */}
  </div>
</article>
```

### Bước 5: Load Thumbnail URLs

```typescript
const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});

useEffect(() => {
    if (!favorites || favorites.length === 0) return;

    const loadThumbnailUrls = async () => {
        const urls: Record<string, string> = {};
        for (const course of favorites) {
            if (course.thumbnailMediaId) {
                // API endpoint handles redirect, use directly in img src
                urls[course.thumbnailMediaId] = `/api/media/${course.thumbnailMediaId}`;
            }
        }
        setThumbnailUrls(urls);
    };

    loadThumbnailUrls();
}, [favorites]);
```

### Bước 6: Test & Verify

```
1. Login
2. Add courses to favorites (heart icon)
3. Visit /khoa-hoc/yeu-thich
4. Verify:
   - ✅ Images load correctly
   - ✅ Card design matches main page
   - ✅ Click "Vào học ngay" → /khoa-hoc/{order}
   - ✅ Empty state shows when no favorites
   - ✅ Loading spinner while fetching
```

### Common Pitfalls

❌ **Lỗi 1:** Dùng `course.slug` cho routing
```typescript
// WRONG
href={`/khoa-hoc/${course.slug}`} // → /khoa-hoc/kho%CC%81a%20ho%CC%A3c%20autocad
```
✅ **Fix:** Dùng `course.order`
```typescript
href={`/khoa-hoc/${course.order}`} // → /khoa-hoc/0
```

❌ **Lỗi 2:** Fetch ảnh kiểu cũ `/api/media/{slug}`
```typescript
// WRONG - Endpoint không tồn tại
src={`/api/media/${course.thumbnailMediaId}`} // 404
```
✅ **Fix:** Tạo API endpoint `/api/media/[id]/route.ts`

❌ **Lỗi 3:** Card design khác trang chính
```typescript
// WRONG - Custom design
<div className="border-2 border-black rounded-2xl">
```
✅ **Fix:** Copy từ course-list-view.tsx
```typescript
// RIGHT - Identical design
<article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200">
```

---

## Level 3: References

- [workflow.md](./references/workflow.md) - Quy trình 6 bước chi tiết
- [image-loading-guide.md](./references/image-loading-guide.md) - Cách fix lỗi ảnh không load
- [routing-fix.md](./references/routing-fix.md) - Giải thích slug vs order field
- [card-design-checklist.md](./references/card-design-checklist.md) - CSS classes cần copy
