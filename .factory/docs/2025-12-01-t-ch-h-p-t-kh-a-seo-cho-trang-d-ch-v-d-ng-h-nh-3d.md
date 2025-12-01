## Kế hoạch tích hợp từ khóa SEO cho trang dịch vụ dựng hình 3D

### 1. **Phân tích hiện trạng**
- Website hiện tại có `ServicesSection.tsx` hiển thị 6 dịch vụ chính
- Có các section khác như Why3DVisualsSection, HeroSection hỗ trợ content 3D
- Metadata SEO cơ bản đã được thiết lập trong `metadata.ts`

### 2. **Chiến lược phân bổ từ khóa**

#### **A. Cập nhật ServicesSection (Ưu tiên cao)**
Tích hợp từ khóa vào 6 dịch vụ hiện có:
- Service 1 (Phim hoạt hình): `làm phim hoạt hình 3D`, `studio làm hoạt hình 3D`, `dựng phim hoạt hình 3D`
- Service 2 (Mô phỏng 3D): `dựng mô phỏng sản phẩm 3D`, `làm mô hình 3D theo yêu cầu`, `dựng sản phẩm 3D quảng cáo`
- Service 3 (VFX): `Thư viện VFX`, `dựng 3D siêu thực – photorealistic`, `render kiến trúc siêu thực`
- Service 4 (Marketing 3D): `làm 3D marketing cho doanh nghiệp`, `làm video 3D quảng cáo`, `thiết kế 3D sản phẩm mỹ phẩm`
- Service 5 (Thiết kế Web): `thiết kế kiến trúc 3D`, `dựng nội thất 3D giá rẻ`, `thiết kế 3D ngoại thất`
- Service 6 (Video AI): `dịch vụ render nhanh 3D`, `làm hình ảnh 3D chuyên nghiệp`, `dựng phối cảnh kiến trúc`

#### **B. Thêm section mới (Khóa học)**
- Tạo CourseSection cho: `khóa học đồ họa 3D`
- Tích hợp vào trang chủ hoặc tạo trang riêng

#### **C. Cập nhật Hero Section**
- Title/subtitle tích hợp: `dịch vụ dựng hình 3D`, `làm hình ảnh 3D chuyên nghiệp`
- CTA buttons với từ khóa phù hợp

#### **D. Cập nhật Why3DVisualsSection** 
- Tích hợp: `dựng nhà chung cư bằng 3D`, `render kiến trúc siêu thực` vào các card

### 3. **Cập nhật SEO Metadata**
```typescript
// metadata.ts - Thêm keywords array
keywords: [
  'dịch vụ dựng hình 3D',
  'làm hình ảnh 3D chuyên nghiệp',
  'thiết kế kiến trúc 3D',
  'render kiến trúc siêu thực',
  'studio làm hoạt hình 3D',
  // ... các từ khóa khác
]
```

### 4. **Schema Markup tối ưu**
Thêm structured data cho:
- Service schema cho từng dịch vụ
- LocalBusiness schema với keywords
- Course schema cho khóa học 3D

### 5. **Internal Linking Strategy**
- Tạo liên kết nội bộ giữa các services với anchor text chứa từ khóa
- Link từ blog/library đến services với từ khóa tương ứng

### 6. **Content Updates cần thực hiện**
1. Cập nhật title, description cho mỗi service card
2. Thêm alt text cho images với từ khóa
3. Tạo H2/H3 tags với từ khóa trong content
4. Thêm FAQ section với câu hỏi chứa từ khóa
5. Cập nhật page title và meta description

### **Thứ tự thực hiện**
1. Cập nhật ServicesSection.tsx với nội dung mới
2. Cập nhật metadata và keywords
3. Thêm structured data schemas
4. Tạo/cập nhật section khóa học nếu cần
5. Kiểm tra và tối ưu hiệu suất