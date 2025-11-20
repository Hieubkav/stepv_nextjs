## Kế hoạch sửa responsive cho phần Stats trên trang About

### Phân tích hiện tại
- File: `apps/web/src/components/sections/about/StatsAbout.tsx`
- Hiện tại dùng `grid-cols-1 md:grid-cols-3` khiến mobile hiển thị 1 cột dọc
- Người dùng phải lướt nhiều khi xem trên mobile

### Các thay đổi cần thực hiện

1. **Sửa grid layout**:
   - Thay `grid-cols-1` thành `grid-cols-3` để mobile hiển thị 3 cột ngang
   - Giữ nguyên `md:grid-cols-3` cho tablet/desktop

2. **Điều chỉnh spacing và font size cho mobile**:
   - Giảm `gap-8` thành `gap-4` hoặc `gap-3` cho mobile
   - Giảm font size của value từ `text-4xl` xuống `text-2xl` hoặc `text-xl` cho mobile
   - Điều chỉnh padding phù hợp với không gian mobile

3. **Sửa divider lines**:
   - Bỏ `divide-y` cho mobile vì giờ hiển thị ngang 1 dòng
   - Thêm `divide-x` cho mobile để ngăn cách giữa các cột

4. **Tối ưu padding cho từng stat item**:
   - Giảm padding trái/phải cho mobile
   - Bỏ `pt-8` cho mobile vì không còn chia thành nhiều dòng

### Code sau khi sửa
```tsx
// Grid layout - mobile hiển thị 3 cột
<div className="grid grid-cols-3 gap-3 md:gap-12 divide-x divide-white/5">

// Font size responsive hơn cho mobile
<h3 className="text-2xl sm:text-3xl md:text-5xl ...">

// Padding tối ưu cho mobile
<div className="text-center px-2 md:px-4">
```

Điều này sẽ giúp mobile hiển thị 3 stats trên 1 dòng ngang, người dùng không cần lướt nhiều.