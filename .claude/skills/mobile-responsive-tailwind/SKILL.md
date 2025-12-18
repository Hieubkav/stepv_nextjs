---
name: mobile-responsive-tailwind
description: Implement mobile-first responsive design using Tailwind CSS `max-md:` prefix without affecting desktop layout. Use when building responsive UIs, fixing mobile layouts, separating mobile from desktop styles, or implementing mobile-specific overrides. Works with Next.js, React, and any Tailwind-based projects.
---

# Mobile-First Responsive with Tailwind Override

Build responsive designs that don't compromise desktop experience by using Tailwind's `max-md:` prefix for mobile-specific overrides.

## When to Use This Skill

✅ **Use when**:
- Building responsive layouts that work on mobile and desktop
- Desktop design is finalized and mobile needs separate treatment
- You want mobile changes to NOT affect desktop (zero breakage)
- Team prefers single component with conditional styles over multiple components
- Working with Tailwind CSS in Next.js or React projects

❌ **Don't use when**:
- Using CSS-in-JS (styled-components, emotion) - use CSS modules instead
- Project doesn't use Tailwind CSS
- Building completely different mobile/desktop UIs (use separate components)

## Quick Start

The core concept: **Tailwind breakpoint prefixes control when styles apply**

```tsx
// Desktop: 28px title, mobile: 20px title
<h1 className="text-[28px] max-md:text-[20px]">
  Title
</h1>

// Desktop: padding 30px, mobile: padding 16px
<div className="px-30 max-md:px-4">
  Content
</div>

// Desktop: hidden navbar, mobile: full width button
<button className="max-md:w-full">
  Search
</button>
```

## Key Concept: Tailwind Breakpoints

Tailwind uses these breakpoints by default:

| Prefix | Screen Size | Usage |
|--------|------------|-------|
| `max-md:` | < 768px (mobile) | Mobile-specific overrides |
| `md:` | ≥ 768px (tablet+) | Tablet and larger |
| `lg:` | ≥ 1024px (desktop) | Desktop and larger |
| `xl:` | ≥ 1280px (large desktop) | Large screens |

**Key principle**: `max-md:` applies ONLY to screens < 768px and overrides all previous desktop styles.

## Instructions

### Step 1: Identify Desktop Layout (Don't Change)

Start by understanding what desktop looks like - this is your baseline.

```tsx
// Example: Desktop form with fixed label width
<div className="flex items-center">
  <label className="w-[170px] text-right">
    Tax Code
  </label>
  <input className="flex-1" />
</div>
```

### Step 2: Add Mobile Overrides with `max-md:`

Add mobile-specific classes using `max-md:` prefix. Desktop classes stay intact.

```tsx
// Desktop: labels right-aligned in 170px column
// Mobile: labels full-width, left-aligned
<div className="flex flex-col sm:flex-row sm:items-center">
  <label className="w-[170px] max-md:w-full text-right max-md:text-left pr-6 max-md:pr-0">
    Tax Code
  </label>
  <input className="flex-1 max-md:h-[40px]" />
</div>
```

**Pattern**: Original class + `max-md:override-class`

### Step 3: Test Breakpoints

Use browser DevTools to verify:

1. Open DevTools: F12
2. Click toggle device toolbar (mobile icon)
3. Check different screen sizes:
   - Mobile: 375px, 424px
   - Tablet: 768px, 1024px
   - Desktop: 1200px+

### Step 4: Common Patterns

#### Layout Stacking
```tsx
// Desktop: side-by-side
// Mobile: stacked vertically
<div className="flex lg:flex-row flex-col gap-4">
  <div className="lg:flex-1">Main</div>
  <div className="lg:w-[300px]">Sidebar</div>
</div>
```

#### Padding & Spacing
```tsx
// Desktop: generous spacing
// Mobile: tight spacing
<div className="px-30 py-10 max-md:px-4 max-md:py-6">
  Content
</div>
```

#### Font Sizes
```tsx
// Desktop: larger text
// Mobile: reduced but readable
<h1 className="text-[28px] max-md:text-[20px] font-bold">
  Heading
</h1>
```

#### Button/Input Heights
```tsx
// Desktop: compact (34px)
// Mobile: touch-friendly (40px+)
<input className="h-[34px] max-md:h-[40px]" />
<button className="px-4 py-2 max-md:px-6 max-md:py-3 max-md:w-full">
  Submit
</button>
```

#### Hiding/Showing Elements
```tsx
// Desktop: visible
// Mobile: hidden
<nav className="max-md:hidden">Desktop Menu</nav>

// Mobile: visible
// Desktop: hidden
<button className="hidden max-md:block">Mobile Menu</button>
```

#### Full-width Elements
```tsx
// Desktop: auto width
// Mobile: full width for better touch targets
<button className="max-md:w-full">Action</button>
<input className="flex-1 max-md:w-full" />
```

### Step 5: Handle Component Layouts

For layouts with sidebar/main content:

```tsx
// Desktop: flex row with sidebar on right
// Mobile: stacked vertically
<div className="flex flex-col lg:flex-row gap-4">
  <div className="w-full lg:flex-1">
    <FormComponent />
  </div>
  
  <div className="w-full lg:w-[300px] flex-shrink-0 max-md:mt-4">
    <SidebarComponent />
  </div>
</div>
```

**Key**: Use `lg:flex-row` for desktop, default `flex-col` for mobile.

### Step 6: Background & Container Sizes

```tsx
// Desktop: tall background (450px)
// Mobile: shorter background (280px)
<div className="absolute top-0 left-0 w-full h-[450px] max-md:h-[280px] bg-blue-600">
  Background
</div>

// Desktop: normal min-height
// Mobile: no minimum height (content-driven)
<div className="min-h-[500px] max-md:min-h-0">
  Card
</div>
```

## Complete Examples

### Example 1: Form with Mobile Overrides

```tsx
// Original desktop form
<form className="space-y-5">
  <div className="flex flex-col sm:flex-row sm:items-center">
    <label className="w-[170px] text-right text-sm pr-6 font-normal">
      Tax Code <span className="text-red-500">(*)</span>
    </label>
    <input
      type="text"
      placeholder="Enter tax code"
      className="flex-1 border h-[34px] px-3"
    />
  </div>
</form>

// With mobile overrides
<form className="space-y-5 max-md:space-y-4">
  <div className="flex flex-col sm:flex-row sm:items-center">
    <label className="w-[170px] max-md:w-full text-right max-md:text-left text-sm pt-2 sm:pt-0 pr-6 max-md:pr-0 max-md:pb-1">
      Tax Code <span className="text-red-500">(*)</span>
    </label>
    <input
      type="text"
      placeholder="Enter tax code"
      className="flex-1 border h-[34px] max-md:h-[40px] px-3"
    />
  </div>
</form>
```

### Example 2: Page Layout with Sidebar

```tsx
// Desktop: main content + sidebar
// Mobile: stacked full-width
<main className="flex-grow w-full max-w-[1170px] mx-auto px-4 max-md:px-3 py-8 max-md:py-4">
  <div className="flex flex-col lg:flex-row gap-4 items-start">
    
    {/* Main content */}
    <div className="w-full lg:flex-1 relative">
      <Content />
    </div>

    {/* Sidebar - full width on mobile */}
    <div className="w-full lg:w-[300px] flex-shrink-0 max-md:mt-4">
      <Sidebar />
    </div>
    
  </div>
</main>
```

### Example 3: Header with Logo Resize

```tsx
// Desktop: full logo width (296px)
// Mobile: compact logo (180px)
<header className="h-[70px] max-md:h-[56px]">
  <div className="px-4 max-md:px-3">
    <Image
      src="/logo.png"
      alt="Logo"
      width={296}
      height={74}
      className="h-auto max-md:w-[180px]"
    />
  </div>
</header>
```

### Example 4: Background Adjustment

```tsx
// Desktop: 450px blue background
// Mobile: 280px blue background (leaves more space)
<div className="min-h-screen flex flex-col relative">
  {/* Background layer */}
  <div className="absolute top-0 left-0 w-full h-[450px] max-md:h-[280px] bg-[#003f97] z-0" />
  
  {/* Content layer */}
  <div className="relative z-10">
    <Header />
    <Main />
  </div>
</div>
```

### Example 5: Info Panel with Styling

```tsx
// Desktop: blue background via parent
// Mobile: styled standalone with background + rounded corners
<div className="text-white max-md:bg-[#003f97] max-md:rounded-lg max-md:mt-2">
  <div className="px-[15px] py-[15px] max-md:py-3">
    <h3 className="font-bold text-[16px] max-md:text-[14px]">
      Information
    </h3>
  </div>
  
  <ul className="max-md:pb-2">
    {items.map(item => (
      <li key={item.id} className="hover:bg-white/10 cursor-pointer">
        <div className="px-[30px] max-md:px-4 py-1 max-md:py-2 text-[13px]">
          {item.text}
        </div>
      </li>
    ))}
  </ul>
</div>
```

## Best Practices

### 1. Desktop-First Approach
✅ **DO**: Write desktop styles first, then add `max-md:` overrides
```tsx
<div className="text-[28px] max-md:text-[20px]">
  // Desktop: 28px, Mobile: 20px
</div>
```

### 2. Consistency with Spacing Scale
✅ **DO**: Use consistent spacing increments
```tsx
// Consistent scaling
<div className="px-30 max-md:px-4 py-10 max-md:py-6">
  // Desktop: 120px / 40px padding
  // Mobile: 16px / 24px padding
</div>
```

### 3. Touch-Friendly Heights on Mobile
✅ **DO**: Increase button/input heights for mobile
```tsx
<button className="h-10 max-md:h-12">
  // Desktop: 40px, Mobile: 48px (easier to tap)
</button>
```

### 4. Full-Width on Mobile
✅ **DO**: Make buttons/inputs full-width on mobile
```tsx
<button className="max-md:w-full">
  Click Me
</button>
```

### 5. Avoid Deep Nesting
❌ **DON'T**: Create complex mobile-specific structures
```tsx
// ❌ Avoid this pattern:
<div className="max-md:hidden">Desktop only</div>
<div className="hidden max-md:block">Mobile only</div>

// ✅ Use single component with overrides:
<div className="text-[28px] max-md:text-[20px]">
  Works for both
</div>
```

### 6. Test at Actual Breakpoints
✅ **DO**: Test at exact breakpoints (768px, 1024px)
```
DevTools:
- 375px (mobile)
- 424px (mobile)
- 768px (tablet - BREAKPOINT)
- 1024px (desktop - BREAKPOINT)
- 1280px (large)
```

### 7. Group Related Overrides
✅ **DO**: Keep mobile overrides close to desktop styles
```tsx
// ✅ Good - clear what changes
<h1 className="text-[28px] max-md:text-[20px] font-bold">
  Title
</h1>

// ❌ Avoid - split across file
<h1 className="text-[28px] font-bold">
// ... later in another component
<h1 className="max-md:text-[20px]">
```

## Performance Considerations

### 1. CSS Size
- Only relevant styles are in CSS bundle
- `max-md:` classes only included if used
- No extra components = smaller JavaScript

### 2. Rendering
- Single component renders for all sizes
- No hydration mismatch (unlike conditional rendering)
- Faster than switching between mobile/desktop components

### 3. Maintenance
- Changes affect both layouts automatically
- No duplicate logic
- Single source of truth

## Troubleshooting

### Issue: Styles not applying on mobile

**Solution**: Check breakpoint is `max-md:` not `md:`
```tsx
// ❌ Wrong - applies on DESKTOP
<div className="md:hidden">Desktop only</div>

// ✅ Correct - applies on MOBILE
<div className="max-md:hidden">Desktop only</div>
```

### Issue: Desktop broken after mobile fix

**Solution**: Ensure you're using `max-md:` (not replacing desktop class)
```tsx
// ❌ Wrong - removes desktop styling
<div className="w-full max-md:px-4"> // Missing desktop px

// ✅ Correct - desktop first, mobile override
<div className="px-30 max-md:px-4">
```

### Issue: Horizontal scrolling on mobile

**Solution**: Check padding and width constraints
```tsx
// ❌ Wrong - total width > screen
<div className="px-30 w-full">

// ✅ Correct - adjust padding for mobile
<div className="px-30 max-md:px-4 w-full">
```

### Issue: Touch targets too small

**Solution**: Increase heights and ensure full-width buttons
```tsx
// ✅ Mobile-friendly
<button className="px-4 py-2 max-md:px-6 max-md:py-3 max-md:w-full">
  Tap me
</button>
```

## Common Mobile-First Patterns

| Component | Desktop | Mobile | Classes |
|-----------|---------|--------|---------|
| Header | 70px height | 56px height | `h-[70px] max-md:h-[56px]` |
| Logo | 296px wide | 180px wide | `w-[296px] max-md:w-[180px]` |
| Padding | 30px horizontal | 16px horizontal | `px-30 max-md:px-4` |
| Title | 28px font | 20px font | `text-[28px] max-md:text-[20px]` |
| Button | 34px height | 40px+ height | `h-[34px] max-md:h-[40px]` |
| Layout | flex-row | flex-col | `flex flex-col lg:flex-row` |
| Sidebar | 300px wide | 100% width | `w-[300px] max-md:w-full` |
| Spacing | space-y-5 | space-y-4 | `space-y-5 max-md:space-y-4` |

## CLI Validation

Check your implementation:

```bash
# Look for common issues in your components
grep -r "max-md:" src/components/

# Verify Tailwind config has mobile breakpoint
grep -A5 "screens:" tailwind.config.ts
```

## References

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js Mobile Optimization](https://nextjs.org/docs/advanced-features/optimizing-fonts)
- [Mobile-First CSS](https://www.uxmatters.com/articles/designing-mobile-first-web-applications-in-2014.html)

## Summary

**Mobile-First Tailwind Override** = Single component + desktop styles + `max-md:` mobile overrides

```
Result:
✅ Desktop stays perfect
✅ Mobile gets custom styling
✅ No duplicate components
✅ Easy to maintain
✅ Better performance
```
