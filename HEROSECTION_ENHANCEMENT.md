# HeroSection Form Enhancement - WebDesign Tab

## 🎯 Tổng quan nâng cấp

Đã áp dụng tính năng upload ảnh với WebP conversion cho tab **WebDesign**, cụ thể là form **HeroSection**.

### ✨ Tính năng mới được áp dụng

1. **🎬 Video Background với Dual Input Mode**
   - Upload file trực tiếp (ảnh/video) với WebP conversion
   - Nhập URL từ internet 
   - Preview cho cả ảnh và video
   - Bucket: `webdesign-assets/hero-backgrounds`

2. **🏢 Brand Logos với Dual Input Mode**
   - Upload logo trực tiếp với WebP optimization
   - Nhập URL logo từ internet
   - Preview realtime cho mỗi logo
   - Bucket: `webdesign-assets/brand-logos`

3. **🧹 Smart Cleanup Integration**
   - Tự động cleanup ảnh/video cũ khi thay đổi
   - Cleanup brand logos khi xóa
   - Sử dụng imageCleanup service đã tạo

### 🛠️ Files được cập nhật

#### `src/components/dashboard/forms/HeroSectionEditForm.tsx`

**Thêm mới:**
- Import `FileUpload` component và `imageCleanup` service
- State management cho dual input modes:
  - `videoInputMode`: 'upload' | 'url'
  - `brandInputModes`: Record<number, 'upload' | 'url'>
  - `videoUploadUrl`, `brandUploadUrls`: Upload state tracking

**Upload Handlers:**
```typescript
// Video background upload
const handleVideoUpload = (url: string, _path: string) => {
  setVideoUploadUrl(url);
  setFormData(prev => ({ ...prev, videoBackground: url }));
};

// Brand logo upload  
const handleBrandUpload = (index: number, url: string, _path: string) => {
  setBrandUploadUrls(prev => ({ ...prev, [index]: url }));
  updateBrand(index, 'url', url);
};
```

**Cleanup Integration:**
```typescript
// Cleanup trong handleSave
if (oldVideoBackground && oldVideoBackground !== formData.videoBackground) {
  await imageCleanup.cleanupAfterUpdate(oldVideoBackground, formData.videoBackground);
}

// Cleanup brand logos đã bị xóa
const removedBrandUrls = oldBrandUrls.filter(url => !newBrandUrls.includes(url));
if (removedBrandUrls.length > 0) {
  await imageCleanup.cleanupAfterDelete(removedBrandUrls);
}
```

### 🎨 UI Enhancements

#### Video Background Section:
- **Toggle buttons**: Upload vs URL
- **FileUpload component**: Support cả ảnh và video (max 20MB)
- **URL preview**: Hiển thị preview cho cả image và video
- **Quality**: 90% cho WebP conversion

#### Brand Logos Section:
- **Individual toggle**: Mỗi brand có toggle riêng Upload/URL
- **FileUpload per brand**: Bucket `webdesign-assets/brand-logos`
- **URL preview**: Realtime preview cho mỗi logo
- **Smart remove**: Cleanup tự động khi xóa brand

### 📊 Technical Specifications

#### Upload Settings:
```typescript
// Video Background
bucket: "webdesign-assets"
folder: "hero-backgrounds"
maxSizeInMB: 20
allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
quality: 90

// Brand Logos  
bucket: "webdesign-assets"
folder: "brand-logos"
maxSizeInMB: 5
allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
quality: 90
```

#### Storage Structure:
```
webdesign-assets/
├── hero-backgrounds/
│   ├── hero-bg-1234567890-abc123.webp
│   └── hero-video-1234567890-def456.webp
└── brand-logos/
    ├── brand-logo-1234567890-ghi789.webp
    └── brand-logo-1234567890-jkl012.webp
```

### 🔧 Cách sử dụng

1. **Truy cập HeroSection Form:**
   - Vào Dashboard: `http://localhost:3002/dashboard`
   - Tab "WebDesign" 
   - Click "Edit" (✏️) trên HeroSection

2. **Video Background:**
   - Toggle "Upload" → Upload file ảnh/video
   - Toggle "URL" → Nhập URL từ internet
   - Preview hiển thị realtime

3. **Brand Logos:**
   - Click "Thêm brand" để thêm logo mới
   - Mỗi brand có toggle Upload/URL riêng
   - Preview hiển thị ngay khi có URL/upload
   - Click 🗑️ để xóa (tự động cleanup)

### 🎯 Benefits

1. **Performance**: WebP conversion giảm 25-50% file size
2. **Flexibility**: Dual input mode phù hợp mọi workflow  
3. **Storage Efficiency**: Smart cleanup tiết kiệm storage cost
4. **UX**: Preview realtime, easy toggle giữa modes
5. **SEO**: Filename optimization với slugify

### 🧪 Testing

1. **Video Background:**
   - Upload ảnh → kiểm tra chuyển WebP
   - Upload video → kiểm tra optimization  
   - Switch URL mode → test preview
   - Save → verify cleanup

2. **Brand Logos:**
   - Thêm brand mới → test upload mode
   - Switch URL mode → test preview
   - Xóa brand → verify cleanup
   - Save → check storage cleanup

### 🔄 Integration với Existing System

- **Tương thích 100%** với database schema hiện tại
- **Backward compatible** với URLs đã có
- **Progressive enhancement** - không ảnh hưởng existing data
- **Consistent UI** với library management đã có

---

## 🎉 Kết quả

HeroSection form đã được nâng cấp hoàn toàn với:
- ✅ Dual input mode cho Video Background
- ✅ Dual input mode cho Brand Logos  
- ✅ WebP conversion tự động
- ✅ Smart cleanup integration
- ✅ Enhanced UI/UX
- ✅ Performance optimization
- ✅ Storage cost reduction

**Ready for production!** 🚀