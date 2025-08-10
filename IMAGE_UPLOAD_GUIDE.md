# 📸 Hướng dẫn Upload Ảnh cho Thư viện

## 🎯 Tính năng mới đã thêm

Dashboard hiện đã hỗ trợ **upload ảnh trực tiếp** cho thư viện thay vì chỉ nhập URL!

### ✨ **Những gì đã được thêm:**

1. **🔧 Hooks mới:**
   - `useFileUpload` - Quản lý upload file lên Supabase Storage
   - Tự động tạo bucket nếu chưa có
   - Validation file size và type

2. **🎨 Components mới:**
   - `FileUpload` - Component upload với drag & drop
   - Preview ảnh trước khi upload
   - Progress bar khi upload

3. **☁️ Supabase Storage:**
   - Bucket: `library-images`
   - Folder: `libraries`
   - Hỗ trợ: JPG, PNG, WEBP, GIF
   - Tối đa: 5MB

## 🚀 Cách sử dụng

### **1. Setup Storage (Lần đầu tiên):**
1. Vào dashboard: `http://localhost:3001/dashboard`
2. Click nút **"Setup Storage"** (màu tím)
3. Kiểm tra console để xem kết quả

### **2. Upload ảnh cho thư viện:**

#### **Tạo thư viện mới:**
1. Vào tab **"Thư viện"**
2. Click **"Thêm thư viện"**
3. Điền thông tin: Title, Description, Type, Pricing
4. **Upload ảnh:**
   - Click vào khung upload
   - Hoặc kéo thả file vào khung
   - Xem preview ảnh
5. Click **"Tạo mới"**

#### **Chỉnh sửa thư viện:**
1. Click icon **bút** trên thư viện
2. Thay đổi ảnh nếu muốn
3. Click **"Cập nhật"**

## 🎨 Giao diện Upload

### **Trạng thái khác nhau:**
- **Chưa có ảnh**: Khung dotted với icon cloud
- **Đang upload**: Spinner + progress bar
- **Có ảnh**: Preview + nút X để xóa
- **Lỗi**: Thông báo lỗi màu đỏ

### **Drag & Drop:**
- Kéo file vào khung upload
- Khung sẽ highlight màu xanh
- Thả file để upload

## 🔧 Cấu hình kỹ thuật

### **Supabase Storage:**
```typescript
Bucket: "library-images"
Folder: "libraries"
Public: true
Max size: 5MB
Types: image/jpeg, image/png, image/webp, image/gif
```

### **Next.js Image Optimization:**
```typescript
// next.config.ts
domains: [
  'eqriodcmakvwbjcbbegu.supabase.co' // Supabase domain
]
```

### **Database Schema:**
```sql
-- Đã thêm cột image_url vào bảng libraries
ALTER TABLE libraries ADD COLUMN image_url TEXT;
```

## 📋 Validation

### **File size:**
- Tối đa: 5MB
- Thông báo lỗi nếu vượt quá

### **File type:**
- Chấp nhận: JPG, PNG, WEBP, GIF
- Từ chối: PDF, DOC, v.v.

### **Upload process:**
1. Validate file
2. Generate unique filename
3. Upload to Supabase Storage
4. Get public URL
5. Update form data
6. Show success notification

## 🛠️ Troubleshooting

### **Lỗi "Bucket not found":**
1. Click nút **"Setup Storage"**
2. Kiểm tra console logs
3. Thử upload lại

### **Lỗi upload:**
1. Kiểm tra file size < 5MB
2. Kiểm tra file type (JPG/PNG/WEBP/GIF)
3. Kiểm tra kết nối internet
4. Xem console để debug

### **Ảnh không hiển thị:**
1. Kiểm tra URL trong database
2. Kiểm tra next.config.ts domains
3. Kiểm tra Supabase Storage permissions

## 🎯 Demo Flow

### **Tạo thư viện với ảnh:**
1. Dashboard → Tab "Thư viện" → "Thêm thư viện"
2. Điền: Title = "3D Perfume Model"
3. Điền: Description = "Luxury perfume 3D visualization"
4. Chọn: Type = "3D Model"
5. Điền: Pricing = "$50"
6. Upload ảnh: Kéo file JPG vào khung
7. Xem preview → Click "Tạo mới"
8. Thấy thư viện mới với ảnh trong grid

## 🎵 Hoàn thành!

Bây giờ dashboard đã có đầy đủ:
- ✅ CRUD hoàn chỉnh
- ✅ Upload ảnh trực tiếp
- ✅ Supabase Storage integration
- ✅ Drag & drop interface
- ✅ File validation
- ✅ Progress tracking
- ✅ Error handling
- ✅ Preview functionality
- ✅ **Auto cleanup storage** (như Observer pattern Laravel)
- ✅ **Orphaned files cleanup**

## 🧹 **Storage Cleanup System**

### **Auto Cleanup khi:**
1. **Upload ảnh mới** → Xóa ảnh cũ tự động
2. **Xóa ảnh** → Xóa file khỏi storage
3. **Xóa thư viện** → Xóa ảnh liên quan
4. **Manual cleanup** → Xóa file không còn được tham chiếu

### **Nút Cleanup Storage:**
- **Màu cam** trong dashboard
- **Quét toàn bộ storage** tìm file orphaned
- **So sánh với database** để tìm file không dùng
- **Xóa file thừa** tự động

**Thư viện giờ đây có thể có ảnh đẹp và storage được quản lý tự động!** 📸✨🧹
