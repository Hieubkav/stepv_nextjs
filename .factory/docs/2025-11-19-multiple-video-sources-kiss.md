## Kế hoạch thực hiện - Giải pháp KISS

Dựa trên research, tôi sẽ sử dụng approach đơn giản nhất:
- **YouTube**: Giữ nguyên YouTube Player API (đã hoạt động tốt)
- **Google Drive**: Dùng iframe với `/preview` URL (đơn giản, không cần thư viện)
- **Không video**: Hiển thị nội dung text và bài tập

### 1. **Cập nhật Database Schema**
```typescript
course_lessons: defineTable({
  // ... existing fields
  videoType: v.optional(v.union(
    v.literal("youtube"), 
    v.literal("drive"), 
    v.literal("none")
  )),
  videoUrl: v.optional(v.string()), // URL chung cho mọi loại
  youtubeUrl: v.optional(v.string()), // Giữ để backward compatible
  // ... rest
})
```

### 2. **Backend Migration (courses.ts)**
- Auto-migrate: Các bài học có `youtubeUrl` → set `videoType: "youtube"` và copy sang `videoUrl`
- Validation: Kiểm tra URL format theo từng loại
  - YouTube: `youtube.com/watch` hoặc `youtu.be`
  - Drive: `drive.google.com/file/d/*/view`

### 3. **Frontend Form (lesson-form.tsx)**
```typescript
// Thêm dropdown chọn loại video
<Select value={videoType} onChange={setVideoType}>
  <option value="youtube">YouTube</option>
  <option value="drive">Google Drive</option>
  <option value="none">Không có video</option>
</Select>

// Hiển thị input URL phù hợp
{videoType !== "none" && (
  <Input 
    placeholder={videoType === "drive" 
      ? "https://drive.google.com/file/d/FILE_ID/view" 
      : "https://youtube.com/watch?v=..."
    }
  />
)}
```

### 4. **Video Player Component**
```typescript
// Render theo loại video
if (videoType === "youtube") {
  // Giữ nguyên YouTube Player API hiện tại
  return <YouTubePlayer {...props} />
  
} else if (videoType === "drive") {
  // Đơn giản dùng iframe
  const embedUrl = convertDriveUrl(videoUrl) // */view → */preview
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="100%"
      allow="autoplay"
      allowFullScreen
    />
  )
  
} else {
  // Hiển thị nội dung text/bài tập
  return <LessonContent {...props} />
}
```

### 5. **Helper Functions**
```typescript
// Convert Drive URL để embed
function convertDriveUrl(url: string): string {
  // https://drive.google.com/file/d/FILE_ID/view
  // → https://drive.google.com/file/d/FILE_ID/preview
  return url.replace('/view', '/preview')
}

// Extract Google Drive file ID
function extractDriveFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}
```

### Ưu điểm của approach này:
✅ **Đơn giản**: Không cần thêm dependencies (react-player ~200KB)
✅ **Backward compatible**: Giữ nguyên `youtubeUrl` cũ
✅ **Dễ maintain**: Code ít phức tạp
✅ **Performance**: Không load thư viện không cần thiết
✅ **Flexible**: Dễ thêm nguồn video mới sau này

### Lưu ý:
- Google Drive video phải set **"Anyone with link"** mới embed được
- Iframe Google Drive không tracking progress như YouTube API
- Có thể thêm react-player sau nếu cần nhiều nguồn video hơn