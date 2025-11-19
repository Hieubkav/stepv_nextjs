# Kế hoạch tối ưu SEO toàn diện cho DOHY Media

## 🎯 Mục tiêu: Đạt điểm SEO 8/10

## 📊 Phân tích hiện trạng (Điểm hiện tại: ~3/10)

### Vấn đề nghiêm trọng:
1. **Không có robots.txt và sitemap.xml** - Thiếu file quan trọng cho search engines
2. **Metadata cực kỳ cơ bản** - Chỉ có title "dohy" và description "dohy" 
3. **Homepage sử dụng 'use client'** - Không tốt cho SEO rendering
4. **Không có structured data** - Thiếu JSON-LD schema markup
5. **Thiếu dynamic metadata** - Các trang course không có metadata riêng
6. **Không có canonical URLs** - Risk duplicate content

### Điểm tốt hiện có:
- Đã set `lang="vi"` cho Vietnamese
- Có cơ bản Open Graph và Twitter cards (nhưng chưa đủ)
- Next.js 15 với support SEO tốt
- Đã có visitor tracking analytics

## 📝 Kế hoạch chi tiết (10 bước)

### 1. **Tạo robots.txt và sitemap động** 
```
- Tạo apps/web/public/robots.txt
- Implement sitemap.xml động với Next.js 15
- Include tất cả public routes, exclude admin/dashboard
```

### 2. **Nâng cấp Root Metadata**
```typescript
// Cải thiện apps/web/src/app/layout.tsx
- Title template: "DOHY Media - {page}"  
- Description chi tiết về dịch vụ
- Keywords phù hợp
- Author, creator metadata
- Verification tags (Google, Bing)
```

### 3. **Thêm Structured Data (JSON-LD)**
```
- Organization schema cho company info
- Course schema cho từng khóa học
- BreadcrumbList cho navigation
- WebSite schema với search action
```

### 4. **Optimize Homepage** 
```
- Chuyển từ 'use client' sang Server Component
- Giữ interactivity với selective client components
- Pre-render static content
```

### 5. **Dynamic Metadata cho Pages**
```typescript
// Mỗi route group cần:
- generateMetadata() function
- Unique title, description
- Dynamic OG images
- Canonical URLs
```

### 6. **Course Pages SEO**
```
- Dynamic title: "{Course Name} | DOHY Media"
- Rich snippets với course details
- Price, duration, instructor info
- Student reviews schema
```

### 7. **Image Optimization**
```
- Alt text mô tả cho tất cả images
- Use next/image với optimization
- WebP format với fallbacks
- Lazy loading strategic
```

### 8. **Technical SEO**
```
- Canonical URLs prevent duplicates
- hreflang tags nếu multi-language
- XML sitemap với priority scores
- Meta robots directives
```

### 9. **Performance Optimization** 
```
- Minimize JavaScript bundles
- Font optimization với display=swap
- Critical CSS inline
- Resource hints (prefetch, preconnect)
```

### 10. **Monitoring & Validation**
```
- Google Search Console setup
- Rich Results Test
- PageSpeed Insights
- Lighthouse CI integration
```

## 🔧 Files sẽ tạo/sửa:

### Tạo mới:
- `apps/web/public/robots.txt`
- `apps/web/src/app/sitemap.ts`
- `apps/web/src/lib/seo/metadata.ts`
- `apps/web/src/lib/seo/structured-data.ts`
- `apps/web/src/components/seo/JsonLd.tsx`

### Sửa đổi:
- `apps/web/src/app/layout.tsx` - Enhanced metadata
- `apps/web/src/app/(site)/page.tsx` - Server component
- `apps/web/src/app/(site)/layout.tsx` - Better metadata
- `apps/web/src/app/(learner)/khoa-hoc/[slug]/page.tsx` - Dynamic SEO
- `apps/web/src/app/(learner)/khoa-hoc/page.tsx` - List page SEO
- All image components - Add proper alt texts

## ✅ Kết quả mong đợi:

- **Technical SEO**: 90%+ (robots, sitemap, structured data)
- **On-page SEO**: 85%+ (metadata, headings, content)  
- **Performance**: 80%+ (Core Web Vitals)
- **Accessibility**: 95%+ (semantic HTML, ARIA)
- **Rich Snippets**: Course cards in search results
- **Social Sharing**: Beautiful OG/Twitter previews

## ⚠️ Lưu ý quan trọng:
- Không làm hỏng chức năng hiện có
- Maintain TypeScript type safety
- Test trên Google Rich Results
- Monitor Search Console sau deploy

Bạn có muốn tôi bắt đầu thực hiện kế hoạch này không?