# Course List Page UI

## Bối cảnh
- Ngày 19/10/2025 dựng lại trang `/khoa-hoc` dựa trên mockup dạng lưới với filter chip, tìm kiếm, sort và phân trang.

## Thực thi
- `apps/web/src/app/(site)/khoa-hoc/page.tsx` chuyển sang gọi `loadCourseList()` để trả về props thuần cho client.
- `CourseListView` (client) nằm tại `apps/web/src/features/learner/pages/course-list-view.tsx`, quản lý filter `price`, `search`, sort và pagination.
- Dữ liệu course được chuẩn hóa thành object string id (`id`, `thumbnailMediaId`, …) trước khi chuyển cho client.
- Thumbnail nạp qua `api.media.list` (kind=image), lọc theo tập ID thực sự cần và truyền map `{ id: { url, title } }`.
- Giá hiển thị dùng `Intl.NumberFormat('vi-VN', 'currency')`, chú ý `pricingType === "free"` và `isPriceVisible`.
- Giao diện chuyển sang vibe vàng-đen giống `/thu-vien` (nền `#05070f`, accent gradient `#f6e05e → #f0b429`, border trắng/10).

## Ghi chú
- Nếu Convex trả lỗi -> `error` được truyền xuống để UI báo đỏ, tránh hiển thị kết quả rỗng gây nhầm lẫn.
- Muốn đổi CTA “Vào học” trỏ sang route khác chỉ cần sửa `CourseCard`.
- Khi thêm field mới cho khoá học, nhớ bổ sung vào `CourseListItem` và normalize bên server component.
