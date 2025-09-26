# Courses Thumbnail Display

## Bối cảnh
- Ngày 23/09/2025 phân tích issue: trang /khoa-hoc không hiển thị ảnh thumbnail dù đã cấu hình trong dashboard.

## Phát hiện chính
- API listCourses đã trả về 	humbnailMediaId (xem packages/backend/convex/courses.ts:280).
- CourseOverviewScreen không lấy media tương ứng và không render thumbnail (pps/web/src/features/learner/pages/course-overview-screen.tsx:354 và :417).
- CourseDetailScreen cũng chưa dùng thumbnail để render ảnh hero.

## Gợi ý xử lý nhanh
1. Tái sử dụng logic map media từ thư viện (pps/web/src/features/library/library-list-view.tsx) cho danh sách khóa học.
2. Render <img /> hoặc component tương tự trong cả card học viên lẫn khách (CourseCard, GuestCourseCard).
3. Cân nhắc preload media map theo 	humbnailMediaId để tránh gọi thừa.

## Lưu ý
- Sau khi chỉnh, chạy unx tsc --project apps/web/tsconfig.json --noEmit và un run --cwd apps/web build theo quy ước.
- Kiểm tra rule trong convex_rule.md nếu cần động chạm backend.
## Thực thi 23/09/2025
- Thêm hook gom danh sách `thumbnailMediaId` và load `api.media.list` (skip khi không cần).
- Bổ sung `CourseThumbnail` render ảnh trong `CourseCard` và `GuestCourseCard` kèm fallback "Chua co anh".
- Skeleton cập nhật có placeholder ảnh 40 rem.
- Lưu ý: Nếu cần tối ưu sau này có thể viết query `media.getMany` để tránh load toàn bộ ảnh.
