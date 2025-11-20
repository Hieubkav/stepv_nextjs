## Kế hoạch cải thiện SiteFooter cho mobile

### 🎯 Mục tiêu
- Làm gọn gàng UI footer trên mobile
- Ẩn các phần tử không cần thiết
- Tăng khả năng sử dụng trên thiết bị di động

### 📱 Cải tiến Mobile-First

#### 1. **Hero Section (Title + Description + Button)**
- **Mobile (<768px):** Ẩn hoàn toàn hero section để tránh rối
- **Desktop:** Giữ nguyên với spacing tối ưu

#### 2. **Logo & Description**  
- **Mobile:** Chỉ hiển thị logo, ẩn description text
- **Desktop:** Hiển thị đầy đủ

#### 3. **Column Links (Studio & Điều khoản)**
- **Mobile:** Sử dụng accordion/collapsible sections với icon mũi tên
- **Desktop:** Hiển thị đầy đủ như hiện tại

#### 4. **Social Links**
- **Mobile:** Chỉ hiển thị 4-5 social quan trọng (Facebook, YouTube, Instagram, TikTok)
- **Desktop:** Hiển thị tất cả 8 social links

#### 5. **Location & Contact**
- **Mobile:** Gộp chung vào 1 section gọn gàng
- **Desktop:** Hiển thị riêng biệt

### 🎨 Cải tiến UX/UI

#### Layout Changes
```tsx
// Mobile: 1 column stacked
// Tablet: 2 columns  
// Desktop: 3-4 columns như hiện tại

grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
```

#### Touch Targets
- Tăng kích thước touch targets lên 44x44px minimum
- Thêm padding cho links để dễ bấm hơn

#### Spacing
- Giảm padding vertical trên mobile (py-8 thay vì py-16)
- Tối ưu gap spacing giữa các sections

### 📦 Components cần update
1. `SiteFooterSection.tsx` - Component chính
2. `block-defaults.ts` - Cấu hình mặc định

### ✨ Tính năng mới
- Thêm state để toggle accordion sections trên mobile
- Responsive hiding với Tailwind classes
- Smooth transitions cho collapsible sections
- Lazy loading cho social icons không quan trọng

Bạn có muốn tôi tiến hành implement các cải tiến này không?