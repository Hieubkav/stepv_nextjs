## Kế hoạch tối ưu Contact Section

### Phân tích vấn đề hiện tại
- Spacing quá lớn và không đồng nhất (gap-12, lg:gap-16)
- Font size không phù hợp mobile (text-5xl heading)
- Quá nhiều divider và decorative elements
- Layout phức tạp với grid 3 cột không cần thiết

### Cải tiến Responsive Layout

#### Mobile (base)
```tsx
// Simplified single column
<section className="py-8 px-4">
  // Compact header
  <h2 className="text-2xl mb-6">
  
  // Stacked contact & banking
  <div className="space-y-6">
```

#### Desktop (md+)
```tsx
// Two column layout only
<section className="md:py-12 md:px-6">
  <div className="md:grid md:grid-cols-2 md:gap-8">
```

### Spacing Scale tối ưu (Tailwind standard)
- **Section padding**: py-8 → md:py-12 (giảm từ py-12)
- **Content gap**: gap-6 → md:gap-8 (giảm từ gap-12/16)
- **Element spacing**: space-y-4 (giảm từ space-y-8)
- **Micro spacing**: mb-2, gap-2 cho các elements nhỏ

### Typography Scale
**Mobile:**
- Heading: text-2xl (giảm từ text-5xl)
- Labels: text-[10px] giữ nguyên
- Body: text-sm
- Small: text-xs

**Desktop:**
- Heading: md:text-4xl (giảm từ md:text-6xl)  
- Body: md:text-base
- Tăng dần responsive

### Simplify Structure
1. **Bỏ grid 3 cột**: Chuyển về 2 cột đơn giản
2. **Bỏ dividers không cần**: Dùng spacing thay vì hr
3. **Group related info**: Gộp address + email, bank info riêng
4. **Compact social icons**: Inline với contact info

### Visual Hierarchy
```
Liên hệ ngay (heading)
├── Contact Info (left/top)
│   ├── Address + Email (grouped)
│   └── Social icons (inline)
└── Banking Info (right/bottom)
    ├── Bank name
    ├── Account number  
    └── QR button
```

### Code improvements
- Bỏ `lg:sticky` trên mobile
- Giảm motion delays
- Simplify hover states
- Remove redundant wrappers