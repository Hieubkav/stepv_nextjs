# Image Loading Guide

## Vấn đề

API endpoint `/api/media/{id}` không tồn tại → 404 errors.

## Giải pháp

### 1. Tạo API Endpoint

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
    const media = await client.query(api.media.list, { kind: "image" });
    const mediaRecord = media.find((m: any) => m._id === id);

    if (!mediaRecord) {
      return new Response("Image not found", { status: 404 });
    }

    if (mediaRecord.url) {
      return Response.redirect(mediaRecord.url, 307);
    }

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

### 2. Sử dụng trong Component

```typescript
// Simple - API endpoint handle redirect
<img src={`/api/media/${course.thumbnailMediaId}`} alt={course.title} />

// Với fallback
<img
  src={`/api/media/${course.thumbnailMediaId}`}
  alt={course.title}
  onError={(e) => {
    (e.target as HTMLImageElement).style.display = 'none';
  }}
/>
```

### 3. Load URL once, reuse

```typescript
const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});

useEffect(() => {
  if (!favorites || favorites.length === 0) return;

  const urls: Record<string, string> = {};
  for (const course of favorites) {
    if (course.thumbnailMediaId) {
      urls[course.thumbnailMediaId] = `/api/media/${course.thumbnailMediaId}`;
    }
  }
  setThumbnailUrls(urls);
}, [favorites]);

// Render
{course.thumbnailMediaId && thumbnailUrls[course.thumbnailMediaId] ? (
  <img src={thumbnailUrls[course.thumbnailMediaId]} alt={course.title} />
) : null}
```

## Troubleshooting

| Lỗi | Giải pháp |
|-----|----------|
| 404 Image not found | Kiểm tra media record tồn tại trong DB |
| Image storage not found | Course thumbnail bị xóa → Fallback UI |
| Timeout loading | API endpoint quá chậm → Cache URLs |
