# Card Design Checklist

## Layout Structure

Copy từ `apps/web/src/features/learner/pages/course-list-view.tsx` - Component `CourseCard`.

```typescript
<article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300">
  {/* Image Section */}
  <div className="relative aspect-video overflow-hidden bg-slate-100">
    {/* Image or Fallback */}
  </div>

  {/* Content Section */}
  <div className="flex flex-1 flex-col gap-3 p-4">
    {/* Title & Subtitle */}
    {/* Price info */}
  </div>

  {/* Action Section */}
  <div className="space-y-2 border-t border-slate-100 px-4 py-3">
    {/* Buttons */}
  </div>
</article>
```

## CSS Classes Detail

### Article (Card Container)
```css
class="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300"
```
- `group` - Enable group-hover effects
- `flex h-full flex-col` - Full height, vertical layout
- `rounded-lg` - Slight border radius
- `border border-slate-200` - Light gray border
- `hover:border-slate-300` - Darker on hover

### Image Wrapper
```css
class="relative aspect-video overflow-hidden bg-slate-100"
```
- `aspect-video` - 16:9 ratio
- `bg-slate-100` - Light background if no image
- `overflow-hidden` - Crop overflow content

### Image Tag
```css
class="h-full w-full object-cover transition duration-500 group-hover:scale-103"
```
- `group-hover:scale-103` - Slight zoom on card hover
- `transition duration-500` - Smooth animation

### Content Wrapper
```css
class="flex flex-1 flex-col gap-3 p-4"
```
- `flex-1` - Take remaining space
- `gap-3` - Space between items

### Title
```css
class="line-clamp-2 text-base font-semibold leading-tight text-slate-900 transition-colors duration-300 group-hover:text-slate-700"
```
- `line-clamp-2` - Max 2 lines
- `group-hover:text-slate-700` - Darker on hover

### Subtitle
```css
class="line-clamp-2 text-xs text-slate-500"
```
- `line-clamp-2` - Max 2 lines
- `text-xs` - Small size
- `text-slate-500` - Gray color

### Price
```css
class="text-sm font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent"
```
- Gradient text: amber → yellow

### Button - Primary
```css
class="block rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-2.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:opacity-95"
```
- Gradient background
- Full width block
- Hover opacity effect

### Button - Secondary
```css
class="block rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 active:bg-slate-200"
```
- Border only style
- Light background
- Hover changes border + bg

## Grid Layout

```typescript
<section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Cards */}
</section>
```

- `gap-5` - Space between cards
- Responsive: 1 col (mobile) → 2 (tablet) → 3 (lg) → 4 (xl)

## Complete Card Example

```typescript
<article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300">
  <div className="relative aspect-video overflow-hidden bg-slate-100">
    {course.thumbnailMediaId && thumbnailUrls[course.thumbnailMediaId] ? (
      <img
        src={thumbnailUrls[course.thumbnailMediaId]}
        alt={course.title}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-103"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.35em] text-slate-400">
        Chưa có ảnh
      </div>
    )}

    <div className="absolute right-3 top-3">
      <CourseFavoriteButton
        studentId={student?._id ? (student._id as any) : null}
        courseId={course._id as any}
        size="md"
      />
    </div>
  </div>

  <div className="flex flex-1 flex-col gap-3 p-4">
    <div className="space-y-2">
      <h3 className="line-clamp-2 text-base font-semibold leading-tight text-slate-900 transition-colors duration-300 group-hover:text-slate-700">
        {course.title}
      </h3>
      {course.subtitle && (
        <p className="line-clamp-2 text-xs text-slate-500">{course.subtitle}</p>
      )}
    </div>

    <div className="mt-auto flex items-center justify-between">
      <span className="text-xs font-medium text-slate-500">
        {course.pricingType === 'free' ? 'Miễn phí' : 'Khóa học'}
      </span>
      <span className="text-sm font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
        {priceText}
      </span>
    </div>
  </div>

  <div className="space-y-2 border-t border-slate-100 px-4 py-3">
    <Link
      href={detailHref}
      className="block rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-2.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:opacity-95"
    >
      Vào học ngay
    </Link>
    <Link
      href={detailHref}
      className="block rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 active:bg-slate-200"
    >
      Xem chi tiết
    </Link>
  </div>
</article>
```

## Checklist

- [ ] Article layout: flex column, h-full
- [ ] Image: aspect-video, object-cover, group-hover:scale-103
- [ ] Title: line-clamp-2, group-hover color
- [ ] Price: gradient text
- [ ] Buttons: Primary (gradient bg), Secondary (border style)
- [ ] Spacing: p-4, gap-3, gap-5 in grid
- [ ] Border colors: slate-200 normal, slate-300 hover
- [ ] Transitions: duration-300 to 500
