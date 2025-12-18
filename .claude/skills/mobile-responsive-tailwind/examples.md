# Mobile-First Tailwind Override - Real Project Examples

Real examples from implementing mobile-first responsive design in a Next.js e-invoice lookup application.

## Example 1: Page Background with Responsive Height

**Scenario**: Blue background behind header takes too much vertical space on mobile

**File**: `HomePage.tsx`

```tsx
// ❌ BEFORE - Same height on all devices
<div className="absolute top-0 left-0 w-full h-[450px] bg-[#003f97] z-0" />

// ✅ AFTER - Responsive height
<div className="absolute top-0 left-0 w-full h-[450px] max-md:h-[280px] bg-[#003f97] z-0" />
```

**Breakdown**:
- `h-[450px]`: Desktop height 450px (preserved)
- `max-md:h-[280px]`: Mobile height reduced to 280px
- Saves 170px vertical space on mobile (+35% more content visible)

**DevTools Verification**:
1. Press F12
2. Toggle device (Ctrl+Shift+M)
3. Set width to 375px → Should see 280px background
4. Set width to 1024px → Should see 450px background

---

## Example 2: Form Labels - Alignment & Width

**Scenario**: Fixed-width labels (170px) don't work on mobile

**File**: `InvoiceLookupForm.tsx`

```tsx
// ❌ BEFORE - Fixed label width everywhere
<div className="flex flex-col sm:flex-row sm:items-center">
  <label className="w-[170px] text-right text-[#333] text-sm pt-2 sm:pt-0 pr-6 font-normal">
    Mã số thuế bên bán <span className="text-red-500">(*)</span>
  </label>
  <input
    type="text"
    className="flex-1 border border-[#ccc] h-[34px] px-3 text-sm"
  />
</div>

// ✅ AFTER - Full-width labels on mobile, fixed on desktop
<div className="flex flex-col sm:flex-row sm:items-center">
  <label className="w-[170px] max-md:w-full text-right max-md:text-left text-[#333] text-sm pt-2 sm:pt-0 pr-6 max-md:pr-0 max-md:pb-1 font-normal">
    Mã số thuế bên bán <span className="text-red-500">(*)</span>
  </label>
  <input
    type="text"
    className="flex-1 border border-[#ccc] h-[34px] max-md:h-[40px] px-3 text-sm"
  />
</div>
```

**Changes**:
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Label width | `w-[170px]` | `max-md:w-full` |
| Label align | `text-right` | `max-md:text-left` |
| Label padding | `pr-6` | `max-md:pr-0 pb-1` |
| Input height | `h-[34px]` | `max-md:h-[40px]` |

**Result**:
- Desktop: Compact form with aligned labels
- Mobile: Full-width, left-aligned labels (easier to tap)

---

## Example 3: Form Captcha - Responsive Layout

**Scenario**: Captcha image + input + button wrap awkwardly on mobile

**File**: `InvoiceLookupForm.tsx`

```tsx
// ❌ BEFORE - Fixed horizontal layout
<div className="flex items-center gap-2">
  <CaptchaCanvas code={captchaCode} onClick={generateCaptcha} />
  <input
    type="text"
    value={captcha}
    className="flex-1 border border-[#ccc] h-[40px] px-3 text-sm"
  />
</div>

<div className="mt-3 flex justify-end">
  <button>Find Invoice</button>
</div>

// ✅ AFTER - Wrapping on mobile, centered button
<div className="flex items-center gap-2 max-md:flex-wrap">
  <CaptchaCanvas code={captchaCode} onClick={generateCaptcha} />
  <input
    type="text"
    value={captcha}
    className="flex-1 max-md:w-full border border-[#ccc] h-[40px] px-3 text-sm"
  />
</div>

<div className="mt-3 flex justify-end max-md:justify-center">
  <button className="bg-[#5cb85c] text-white px-4 py-2 max-md:px-6 max-md:py-3 max-md:w-full">
    Find Invoice
  </button>
</div>
```

**Patterns Used**:
- `max-md:flex-wrap`: Allow wrapping on mobile
- `max-md:w-full`: Input takes full width when wrapped
- `max-md:justify-center`: Center button on mobile
- `max-md:px-6 max-md:py-3 max-md:w-full`: Full-width button with better padding

**Before (mobile)**:
```
[Captcha] [Input............] 
[Button...]
```

**After (mobile)**:
```
[Captcha]
[Input................]
[    Find Invoice    ]
```

---

## Example 4: Form Spacing - Consistent Vertical Rhythm

**Scenario**: Form needs tighter spacing on mobile to fit content

**File**: `InvoiceLookupForm.tsx`

```tsx
// ❌ BEFORE - Same spacing everywhere
<div className="px-30 py-10 flex-grow">
  <h2 className="text-[28px] text-[#555555] text-center mb-10 font-normal">
    Enter invoice information
  </h2>

  <div className="w-full max-w-[700px] mx-auto space-y-5">
    {/* Form fields */}
  </div>
</div>

// ✅ AFTER - Responsive spacing
<div className="px-30 max-md:px-4 py-10 max-md:py-6 flex-grow">
  <h2 className="text-[28px] max-md:text-[20px] text-[#555555] text-center mb-10 max-md:mb-6 font-normal">
    Enter invoice information
  </h2>

  <div className="w-full max-w-[700px] mx-auto space-y-5 max-md:space-y-4">
    {/* Form fields */}
  </div>
</div>
```

**Spacing Changes**:
| Element | Desktop | Mobile | Savings |
|---------|---------|--------|---------|
| Horizontal padding | `px-30` (120px) | `max-md:px-4` (16px) | 104px |
| Vertical padding | `py-10` (40px) | `max-md:py-6` (24px) | 16px |
| Title size | `text-[28px]` | `max-md:text-[20px]` | 8px |
| Title margin | `mb-10` (40px) | `max-md:mb-6` (24px) | 16px |
| Field spacing | `space-y-5` (20px) | `max-md:space-y-4` (16px) | 4px |

**Visual Effect**:
- Desktop: Generous padding, readable
- Mobile: Tight but not cramped, more content visible

---

## Example 5: Page Header Logo Scaling

**Scenario**: Full-size logo (296px) doesn't fit mobile header

**File**: `Header.tsx`

```tsx
// ❌ BEFORE - Fixed logo size
<header className="w-full bg-transparent h-[70px] flex items-center">
  <div className="max-w-[1170px] mx-auto w-full px-4 flex justify-between items-center">
    <Image
      src="/logo.png"
      alt="E-Invoice NET"
      width={296}
      height={74}
      className="h-auto"
    />
  </div>
</header>

// ✅ AFTER - Responsive header and logo
<header className="w-full bg-transparent h-[70px] max-md:h-[56px] flex items-center">
  <div className="max-w-[1170px] mx-auto w-full px-4 max-md:px-3 flex justify-between items-center">
    <Image
      src="/logo.png"
      alt="E-Invoice NET"
      width={296}
      height={74}
      className="h-auto max-md:w-[180px]"
    />
  </div>
</header>
```

**Header Scaling**:
- Desktop: 70px height, 296px logo
- Mobile: 56px height, 180px logo
- Header padding: 16px → 12px

**Why**: 
- Saves 14px vertical space (20% reduction)
- Logo still visible and branded
- Better proportions on small screen

---

## Example 6: Responsive Layout - Main + Sidebar

**Scenario**: Sidebar works on desktop but needs stacking on mobile

**File**: `HomePage.tsx`

```tsx
// ❌ BEFORE - Always side-by-side
<main className="flex-grow w-full max-w-[1170px] mx-auto px-4 py-8">
  <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
    <div className="w-full lg:flex-1 relative">
      {/* Main content */}
    </div>

    <div className="w-full lg:w-[300px] flex-shrink-0">
      {/* Sidebar - always shows */}
    </div>
  </div>
</main>

// ✅ AFTER - Responsive layout + spacing
<main className="flex-grow w-full max-w-[1170px] mx-auto px-4 max-md:px-3 py-8 max-md:py-4 relative">
  <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
    <div className="w-full lg:flex-1 relative">
      <div className="absolute -top-[48px] right-0 z-10 max-md:hidden">
        {/* Navigation - hidden on mobile */}
      </div>
      {/* Main content */}
    </div>

    <div className="w-full lg:w-[300px] flex-shrink-0 max-md:mt-4">
      {/* Sidebar - full width on mobile */}
    </div>
  </div>
</main>
```

**Layout Changes**:
- **Desktop (≥1024px)**: Main content + right sidebar
- **Mobile (<1024px)**: Full-width stacked layout

**Additional Changes**:
- `max-md:hidden`: Hide desktop navigation on mobile
- `max-md:mt-4`: Add spacing between main and sidebar on mobile
- `max-md:px-3`: Reduce horizontal padding
- `max-md:py-4`: Reduce vertical padding

---

## Example 7: Info Panel Styling for Mobile

**Scenario**: Info panel styled by parent div on desktop; needs standalone styling on mobile

**File**: `InfoPanel.tsx`

```tsx
// ❌ BEFORE - No mobile-specific styling
<div className="text-white">
  <div className="px-[15px] py-[15px]">
    <h3 className="font-bold text-[16px]">
      Information about e-invoices
    </h3>
  </div>

  <ul>
    {links.map((link) => (
      <li key={link.id} className="hover:bg-white/10 cursor-pointer">
        <div className="px-[30px] py-1 text-[13px]">
          {link.text}
        </div>
      </li>
    ))}
  </ul>
</div>

// ✅ AFTER - Mobile background and styling
<div className="text-white max-md:bg-[#003f97] max-md:rounded-lg max-md:mt-2">
  <div className="px-[15px] py-[15px] max-md:py-3">
    <h3 className="font-bold text-[16px] max-md:text-[14px]">
      Information about e-invoices
    </h3>
  </div>

  <ul className="max-md:pb-2">
    {links.map((link) => (
      <li key={link.id} className="hover:bg-white/10 cursor-pointer">
        <div className="px-[30px] max-md:px-4 py-1 max-md:py-2 text-[13px]">
          {link.text}
        </div>
      </li>
    ))}
  </ul>

  <div className="px-[15px] py-[15px] max-md:py-3">
    {/* Back link */}
  </div>
</div>
```

**Mobile Styling**:
- `max-md:bg-[#003f97]`: Add blue background
- `max-md:rounded-lg`: Add rounded corners
- `max-md:mt-2`: Add top margin
- `max-md:text-[14px]`: Smaller title
- `max-md:px-4 py-2`: Adjust padding for better spacing
- `max-md:pb-2`: Add bottom padding

**Result**:
- Desktop: Panel styled by parent (white text on blue background)
- Mobile: Panel is self-contained with background and rounded corners

---

## Example 8: Share Buttons Footer

**Scenario**: Footer buttons need better layout on mobile

**File**: `InvoiceLookupForm.tsx`

```tsx
// ❌ BEFORE - Always right-aligned
<div className="bg-[#fafafa] py-4 px-8">
  <div className="flex items-center justify-end gap-2">
    <span className="text-black text-sm">Share:</span>

    <button className="w-[25.5px] h-[25.5px]">
      <img src="/g.png" alt="Google" className="w-full h-full" />
    </button>
    {/* More buttons */}
  </div>
</div>

// ✅ AFTER - Centered on mobile
<div className="bg-[#fafafa] py-4 px-8 max-md:px-4">
  <div className="flex items-center justify-end max-md:justify-center gap-2">
    <span className="text-black text-sm">Share:</span>

    <button className="w-[25.5px] h-[25.5px]">
      <img src="/g.png" alt="Google" className="w-full h-full" />
    </button>
    {/* More buttons */}
  </div>
</div>
```

**Changes**:
- `max-md:px-4`: Reduce footer padding on mobile
- `max-md:justify-center`: Center buttons instead of right-align

---

## Example 9: Modal View - Responsive Controls

**Scenario**: Modal shows invoice but controls need better layout on mobile

**File**: `InvoiceLookupForm.tsx` (modal section)

```tsx
// ✅ Already responsive controls
<div className="flex flex-col md:flex-row items-center justify-between gap-4">
  {/* Pagination controls */}
  <div className="flex items-center gap-1">
    {/* Buttons */}
  </div>

  {/* Action buttons */}
  <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
    <Info className="w-5 h-5 text-red-500 mr-2" />
    
    <button className="flex items-center gap-1 bg-[#5bc0de]">
      <Printer className="w-4 h-4" />
      <span>Print Invoice</span>
    </button>

    <button className="flex items-center gap-1 bg-[#f0ad4e]">
      <FileText className="w-4 h-4" />
      <span>Download Invoice</span>
    </button>
  </div>
</div>
```

**Mobile-Responsive Features**:
- `md:flex-row` + default `flex-col`: Stacks on mobile, horizontal on desktop
- `justify-center md:justify-end`: Centers on mobile, right-aligns on desktop
- `flex-wrap`: Allows wrapping of buttons if needed

---

## Quick Reference: Common Patterns Used

### Pattern 1: Width Responsive
```tsx
className="w-[170px] max-md:w-full"
// Desktop: fixed width, Mobile: full width
```

### Pattern 2: Padding Responsive
```tsx
className="px-30 max-md:px-4 py-10 max-md:py-6"
// Desktop: generous, Mobile: tight
```

### Pattern 3: Text Size Responsive
```tsx
className="text-[28px] max-md:text-[20px]"
// Desktop: large, Mobile: readable
```

### Pattern 4: Alignment Responsive
```tsx
className="text-right max-md:text-left"
// Desktop: right-aligned, Mobile: left-aligned
```

### Pattern 5: Layout Responsive
```tsx
className="flex flex-col lg:flex-row"
// Mobile: vertical, Desktop: horizontal
```

### Pattern 6: Visibility Responsive
```tsx
className="max-md:hidden"
// Mobile: hidden, Desktop: visible
```

### Pattern 7: Height Responsive
```tsx
className="h-[34px] max-md:h-[40px]"
// Desktop: compact, Mobile: touch-friendly
```

### Pattern 8: Spacing Responsive
```tsx
className="space-y-5 max-md:space-y-4"
// Desktop: 20px gap, Mobile: 16px gap
```

---

## Testing Checklist

After implementing mobile-first responsive design:

- [ ] Desktop (1024px+): Original design preserved
- [ ] Tablet (768px-1023px): Scales appropriately
- [ ] Mobile (< 768px): All content readable
- [ ] Touch targets: ≥44px minimum
- [ ] No horizontal scroll on mobile
- [ ] Images scale properly
- [ ] Forms work on mobile keyboard
- [ ] Modal/dialogs fit screen
- [ ] Navigation accessible
- [ ] Text contrast maintained
