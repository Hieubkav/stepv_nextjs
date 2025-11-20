# 🚀 Spec: Thay thế trang About với thiết kế Premium từ Gemini

## 📋 Tổng quan
Thay thế hoàn toàn trang About hiện tại bằng thiết kế mới từ Gemini với:
- **5 sections chính**: Hero, Stats, BentoGrid, Portfolio/Vision, CTA
- **Dark luxury theme**: Black (#050505) + Gold (#D4AF37)
- **Premium typography**: Serif headings + Sans body
- **Advanced animations**: Framer Motion effects

## 🎨 Cấu trúc Components mới

### 1. **HeroAbout Component**
```tsx
// Nội dung:
- Split layout: Text (left) + Image (right)
- Gradient gold text cho "Digital World"
- 3 status pills: Academy, Plugins & Assets, Production
- Background: Gold glow ambient effect
- Image: Abstract 3D art với hover effects

// Data động từ Convex:
- siteName → "Dohy Studio Official"
- Hardcoded: Headline & description
```

### 2. **StatsAbout Component**
```tsx
// Stats grid 3 cột:
- "03" - Hệ Sinh Thái
- "5K+" - Học Viên
- "100%" - Chất Lượng

// Design:
- Font serif cho numbers
- Gold divider line
- Uppercase tracking labels
- Stagger animation on view
```

### 3. **BentoGridAbout Component** (Service Pillars)
```tsx
// 3 service cards:
1. Dohy Academy - Education
2. Dohy Store - Resources
3. Dohy VFX - Production

// Features:
- Grayscale → color on hover
- Gold line animation
- Icon badges
- Feature pills
- CTA với arrow animation
```

### 4. **VisionAbout Component** (Portfolio section)
```tsx
// Split layout:
- Left: Philosophy text
- Right: Abstract image

// Content:
- "Chất Lượng Là Tiêu Chuẩn Duy Nhất"
- 2 value cards: Sáng Tạo & Hiệu Suất
- Border decorations
```

### 5. **CTAAbout Component**
```tsx
// 2 columns:
LEFT:
- "Sẵn Sàng Bứt Phá?"
- Contact info (dynamic từ Convex)
- Social icons

RIGHT:
- Banking card với QR code
- Modal popup QR
- Copy số tài khoản feature

// Data động:
- address, email, zaloUrl từ settings
- bankName, accountNumber, accountHolder
- Social links (FB, IG, YT, TikTok)
```

## 🔧 Implementation Details

### **File Structure**
```
apps/web/src/
├── app/(site)/about/
│   └── page.tsx (main page)
└── components/sections/about/
    ├── HeroAbout.tsx
    ├── StatsAbout.tsx
    ├── BentoGridAbout.tsx
    ├── VisionAbout.tsx
    └── CTAAbout.tsx
```

### **Data Integration**
```typescript
// Từ Convex settings (dynamic):
{
  siteName: settings?.siteName,
  logoUrl: settings?.logoUrl,
  contactEmail: settings?.contactEmail,
  address: settings?.address,
  zaloUrl: settings?.zaloUrl,
  facebookUrl: settings?.facebookUrl,
  instagramUrl: settings?.instagramUrl,
  youtubeUrl: settings?.youtubeUrl,
  tiktokUrl: settings?.tiktokUrl,
  bankAccountNumber: settings?.bankAccountNumber,
  bankAccountName: settings?.bankAccountName,
  bankCode: settings?.bankCode
}

// Hardcoded content:
- Headlines, descriptions
- Stats numbers
- Service pillar content
- Philosophy text
```

### **Styling Updates**
```scss
// New color scheme:
$black-rich: #050505;
$black-bg: #0A0A0A;
$gray-dark: #0F0F0F;
$gold: #D4AF37;
$cream: #F5E6D3;

// Typography:
font-serif: 'Playfair Display' or system serif
font-sans: 'Inter' or system sans-serif
```

### **Animation Specs**
```javascript
// Framer Motion patterns:
- whileHover: { y: -5, scale: 1.05 }
- whileInView: { opacity: 1, y: 0 }
- Initial/animate for stagger effects
- Transition: duration 0.3-1s, ease "easeOut"
```

## 📱 Responsive Design

```
Mobile (<640px):
- Stack all layouts
- Reduce font sizes
- Hide decorative elements

Tablet (640-1024px):
- 1 column bento grid
- Maintain visual hierarchy

Desktop (>1024px):
- Full split layouts
- 3 column grids
- All animations enabled
```

## 🎯 Key Features to Implement

1. **QR Code Modal**
   - Click to show fullscreen
   - Animated entrance/exit
   - Copy account number

2. **Image Hover Effects**
   - Grayscale → color
   - Scale animations
   - Opacity transitions

3. **Gold Accents**
   - Border animations
   - Glow effects
   - Text gradients

4. **Copy to Clipboard**
   - Account number click to copy
   - Toast notification

## ✅ Implementation Steps

1. **Delete current About components** (6 files)
2. **Create new components** (5 files)
3. **Update page.tsx** với new imports
4. **Add images/assets** (use Unsplash URLs)
5. **Test responsive** & animations
6. **Verify Convex data** integration

## 🚫 Components to Remove
```
- HeroAbout.tsx (old)
- StoryAbout.tsx
- ValuesAbout.tsx
- AchievementsAbout.tsx
- ContactCTAAbout.tsx
```

## ✨ Expected Result

Trang About mới sẽ có:
- **Premium dark theme** với gold accents
- **Professional layout** theo style studio sáng tạo
- **Smooth animations** với Framer Motion
- **Data integration** từ Convex settings
- **Mobile optimized** responsive design
- **Interactive elements**: QR modal, copy clipboard
- **Modern aesthetics** không generic

Thiết kế mới này sophisticated hơn nhiều, phù hợp với brand positioning của DOHY Studio!