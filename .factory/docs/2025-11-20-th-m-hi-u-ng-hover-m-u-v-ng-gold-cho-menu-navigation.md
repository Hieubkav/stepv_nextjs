## Kế hoạch thực hiện hiệu ứng hover màu vàng gold cho menu

### 📋 Phân tích hiện tại:
- File cần chỉnh sửa: `apps/web/src/components/layout/header.tsx`
- Màu gold đã định nghĩa: `#FFD700` (class `.stepv-primary`)
- Có 3 vị trí menu cần update:
  1. **Top Header** (header cố định trên cùng)
  2. **Sticky Header** (header xuất hiện khi scroll)
  3. **Mobile Menu** (menu trên thiết bị di động)

### 🎯 Các thay đổi sẽ thực hiện:

#### 1. **Top Header Menu Items** (dòng 95-115):
- Thay `hover:text-gray-300` → `hover:text-[#FFD700] transition-colors duration-300`
- Thêm hiệu ứng chuyển màu mượt mà

#### 2. **Sticky Header Menu Items** (dòng 216-236):
- Thay `hover:text-gray-300` → `hover:text-[#FFD700] transition-colors duration-300`
- Giữ nguyên hiệu ứng active với border-bottom

#### 3. **Mobile Menu Items** (dòng 328-361):
- Thay `hover:bg-white/10` → `hover:bg-[#FFD700]/20 hover:text-[#FFD700]`
- Tạo hiệu ứng nền vàng nhạt khi hover

### ✨ Hiệu ứng bổ sung (tùy chọn):
```css
/* Có thể thêm text-shadow cho hiệu ứng phát sáng */
hover:text-[#FFD700] hover:drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]
```

### 🔧 Chi tiết implementation:
- Sử dụng màu gold chuẩn `#FFD700` đã có trong hệ thống
- Thêm `transition-colors duration-300` để chuyển màu mượt mà
- Đảm bảo consistency giữa các phần header khác nhau

Bạn có muốn tôi tiến hành thực hiện các thay đổi này không?