## Kế hoạch thực hiện

Tôi sẽ cập nhật component **CourseCard** trong file `course-list-view.tsx` để thêm hiệu ứng hover màu vàng gold sang trọng cho các thẻ khóa học:

### 1. Cập nhật CSS classes cho thẻ khóa học
- Thêm border màu vàng gold khi hover
- Thêm shadow effect với màu vàng gold nhẹ
- Thêm hiệu ứng scale nhẹ và transition mượt mà

### 2. Chi tiết thay đổi:
```tsx
// Thay thế class hiện tại:
className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300"

// Bằng:
className="group flex h-full flex-col overflow-hidden rounded-lg border-2 border-slate-200 bg-white transition-all duration-300 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-200/30 hover:-translate-y-1"
```

### 3. Tùy chỉnh thêm:
- Cập nhật màu tiêu đề khi hover sang màu amber
- Thêm hiệu ứng glow nhẹ cho button "Vào học ngay"
- Đảm bảo các transition smooth và sang trọng

Hiệu ứng này sẽ tạo cảm giác premium với màu vàng gold (#FFC107 / amber-400) khi hover vào các khóa học.