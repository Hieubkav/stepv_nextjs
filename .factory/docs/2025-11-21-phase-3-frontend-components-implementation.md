# Phase 3: Cart, Checkout & Library UI

## Files tạo mới (14 files, ~1500 lines):

### 1. Cart System
- contexts/CartContext.tsx - State management
- components/cart/CartIcon.tsx - Header icon
- components/cart/CartDrawer.tsx - Slide panel
- components/cart/CartItem.tsx - Item display

### 2. Checkout Flow
- app/(site)/checkout/page.tsx - Main checkout
- components/checkout/CheckoutForm.tsx - Customer info
- components/checkout/BankInfo.tsx - Payment instructions
- components/checkout/OrderSuccess.tsx - Confirmation

### 3. My Library
- app/(site)/my-library/page.tsx - Main library
- components/LibraryTabs.tsx - 3 tabs layout
- components/CourseCard.tsx - Course with progress
- components/ResourceCard.tsx - Download resources
- components/VfxCard.tsx - Download VFX

## Key Features:
✅ Multi-item cart với localStorage
✅ Guest & logged-in checkout
✅ Auto-generate order number (DH-YYMM-XXX)
✅ Bank transfer instructions
✅ 3-tab library (Courses|Resources|VFX)
✅ Download tracking
✅ Course progress display

## Implementation Steps:
1. Create CartContext với localStorage persistence
2. Add cart icon to header
3. Build checkout page với bank info
4. Create my-library với 3 tabs
5. Connect to backend APIs
6. Test full flow

Time: 2-3 days
Risk: Low (UI only, backend ready)