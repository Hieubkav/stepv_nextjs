# Hướng dẫn triển khai: Hệ thống Authentication & E-commerce Thống nhất

## Phase 1: Thiết lập Database ✅ HOÀN THÀNH

### Các bảng được tạo mới:

#### 1. **customers** (thay thế students)
- ID: `v.id("customers")`
- Các trường chính:
  - `account`, `email`, `password` - Authentication
  - `customerType` - individual/business/student
  - `avatar`, `bio` - Profile enhancements
  - Auth tokens: `resetToken`, `rememberToken`
- Indexes: `by_account`, `by_email`, `by_customer_type`, `by_active_order`

#### 2. **vfx_products** (mới - hiệu ứng video)
- ID: `v.id("vfx_products")`
- Các trường:
  - Media: `previewVideoId`, `downloadFileId` (lưu trong storage)
  - Technical: `duration`, `resolution`, `frameRate`, `format`, `hasAlpha`, `fileSize`
  - Category: explosion, fire, smoke, water, magic, particle, transition, other
  - Pricing & Stats: `pricingType`, `priceAmount`, `downloadCount`
- Indexes: `by_slug`, `by_category`, `by_active_order`, `by_pricing_order`

#### 3. **orders** (unified cho tất cả product types)
- ID: `v.id("orders")`
- Polymorphic support:
  - `productType` - course/resource/vfx/bundle
  - `courseId`, `resourceId`, `vfxId` - optional product IDs
- Status: pending, processing, paid, completed, cancelled, refunded
- Pricing: `amount`, `discountAmount`, `finalAmount`
- Indexes: `by_customer`, `by_product_type`, `by_course`, `by_resource`, `by_vfx`, `by_status`, `by_customer_status`

#### 4. **customer_purchases** (unified access control)
- ID: `v.id("customer_purchases")`
- Access control: active, expired, revoked, lifetime
- Tracking: `accessStartDate`, `accessEndDate`, `downloadCount`
- Course specific: `progressPercent`, `completedAt`, `certificateId`
- Indexes: `by_customer`, `by_order`, `by_customer_product`, `by_access_status`, `by_course`, `by_resource`, `by_vfx`

## Phase 2: Backend Functions ✅ HOÀN THÀNH

### 1. **customers.ts** (Authentication & Profile)
```typescript
// Auth functions
authenticateCustomer()      // Login
createCustomer()            // Register
updateCustomer()            // Update profile
changePassword()            // Change password

// Token management
requestPasswordReset()       // Request reset token
verifyResetToken()          // Verify reset token
resetPassword()             // Reset password with token
verifyRememberToken()       // Auto-login
updateRememberToken()       // Remember me toggle

// List & Get
listCustomers()             // List with filtering
getCustomer()               // Get by ID
getCustomerProfile()        // Get public profile
```

### 2. **vfx.ts** (VFX Products Management)
```typescript
// CRUD
createVfxProduct()          // Create new VFX
getVfxProduct()            // Get by ID
getVfxProductBySlug()      // Get by slug
updateVfxProduct()         // Update
deleteVfxProduct()         // Delete (with cleanup)

// Filtering & Search
listVfxProducts()          // List with filtering
getVfxByCategory()         // Filter by category
getTrendingVfx()           // Trending by downloads

// Management
incrementVfxDownloadCount()
setVfxProductActive()
reorderVfxProducts()
```

### 3. **purchases.ts** (Purchase Management)
```typescript
// Query & Access
getCustomerPurchases()     // Get customer's purchases
getCustomerPurchaseByProduct() // Get single purchase
hasProductAccess()         // Check if customer has access
hasPurchased()            // Check if customer purchased

// Create & Update
createPurchase()          // Create after order
updatePurchaseStatus()    // Change access status
incrementDownloadCount()  // Track downloads
updateLastAccessedAt()    // Track access

// Course specific
updateCourseProgress()    // Update progress
completeCourse()          // Mark as completed

// Enriched queries
getCustomerPurchasesEnriched()  // With product details
getActivePurchases()            // Active access only
getRecentPurchases()            // Recent purchases
getPurchasesByOrder()           // By order ID
```

## Phase 3: Frontend Authentication ✅ HOÀN THÀNH

### CustomerAuthContext
Vị trí: `apps/web/src/features/auth/customer-auth-context.tsx`

**Features:**
- Session management (localStorage + memory)
- Remember me functionality (30 days)
- Auto-login with remember token
- Real-time profile sync
- Cross-tab synchronization

**API:**
```typescript
const {
  customer,              // Current customer or null
  status,                // 'idle' | 'loading' | 'authenticated'
  isAuthenticated,       // Boolean for easy checks
  customerType,          // individual | business | student
  error,                 // Last error message
  
  // Methods
  login(),               // (email, password, rememberMe) => Promise
  register(),            // (account, email, password, fullName, ...) => Promise
  logout(),              // () => void
  refresh(),             // () => Promise (sync from server)
  updateProfile(),       // (data) => Promise
} = useCustomerAuth();
```

## Phase 4: Tiếp theo - UI Components (Week 3-4)

### 1. **Unified Header** (thay CTA button)
```typescript
// components/layout/unified-header.tsx
- Login/Register buttons (nếu chưa login)
- Customer dropdown menu (nếu đã login)
- Customer type badge
- Quick links: Purchases, Downloads, Profile, Logout
- Dark mode toggle (cho /khoa-hoc)
```

### 2. **VFX Product Pages**
```
/vfx/                           # List page
/vfx/[slug]                     # Detail page
  - Preview video player
  - Technical specs
  - Download after purchase
```

### 3. **Unified Checkout**
```typescript
// Support: Course + Resource + VFX
// Cart items with product type
// Multi-product bundles
// Coupon application
```

### 4. **Purchase Center**
```
/account/purchases              # All purchases
/account/downloads              # Download center
/account/certificates           # Certificates (for courses)
```

## Phase 5: Migration Strategy

### Bước 1: Tạo Customers từ Students
```typescript
// Migration function
const students = await db.query("students").collect();
for (const student of students) {
  await db.insert("customers", {
    ...student,
    customerType: "individual",
    // map other fields
  });
}
```

### Bước 2: Migrate Course Enrollments
```typescript
// Tạo customer_purchases records
const enrollments = await db.query("course_enrollments").collect();
for (const e of enrollments) {
  await db.insert("customer_purchases", {
    customerId: e.userId,
    orderId: ..., // Tạo order mới
    productType: "course",
    courseId: e.courseId,
    accessStatus: mapStatus(e.status),
    // ...
  });
}
```

### Bước 3: Update Orders
```typescript
// Thêm customerId, productType, finalAmount
// Giữ nguyên course orders ban đầu, thêm mới khi có resources/vfx
```

## Kiểm tra & Validate

### Type Checking
```bash
bun check-types
# ✅ Passed (2025-11-20)
```

### Files được tạo/sửa
- ✅ `packages/backend/convex/schema.ts` - 4 tables mới
- ✅ `packages/backend/convex/customers.ts` - Auth & profile
- ✅ `packages/backend/convex/vfx.ts` - VFX products
- ✅ `packages/backend/convex/purchases.ts` - Purchase management
- ✅ `apps/web/src/features/auth/customer-auth-context.tsx` - Frontend auth
- ✅ `apps/web/src/features/auth/index.ts` - Export module
- ✅ `migration-plan.md` - Detailed plan
- ✅ `IMPLEMENTATION_GUIDE.md` - This file

## Dark Mode Support

### Cho /khoa-hoc
Hiện tại light mode. Plan:
1. Thêm dark mode toggle vào header
2. Update CSS variables cho dark mode
3. Test contrast & readability
4. Update shadcn/ui components

## Security Checklist

- ✅ Hash passwords (existing)
- ✅ Rate limit auth attempts
- ✅ Secure session tokens
- ✅ CSRF protection
- ✅ Verify purchase before download
- ✅ Check access expiry
- ✅ Audit trail for downloads

## Timeline

| Week | Tasks |
|------|-------|
| 1 | ✅ Database + Backend functions |
| 2 | Unified Header + Auth UI |
| 3 | VFX pages + Checkout |
| 4 | Dark mode + Payment |
| 5 | Migration + Testing + Deploy |

## Kiểm tra & QA

### Authentication Tests
- [ ] Login with email/password
- [ ] Register new customer
- [ ] Password reset flow
- [ ] Remember me (30 days)
- [ ] Cross-tab sync
- [ ] Session expiry

### Purchase Tests
- [ ] Buy course
- [ ] Buy resource
- [ ] Buy VFX
- [ ] Bundle purchase
- [ ] Payment confirmation
- [ ] Access check

### UI Tests
- [ ] Header responsive
- [ ] Customer dropdown
- [ ] Dark mode toggle
- [ ] Mobile menu
- [ ] Loading states

## Lưu ý quan trọng

1. **Backward Compatibility**
   - Giữ nguyên `students` table (deprecated)
   - Giữ nguyên `course_enrollments` (deprecated)
   - New code dùng `customers` + `customer_purchases`

2. **Data Integrity**
   - Test migration scripts riêng
   - Backup full trước migration
   - Gradual rollout

3. **Performance**
   - Index optimization
   - Query batching
   - Lazy load VFX videos

4. **Scalability**
   - Support millions of purchases
   - Real-time sync optimization
   - Caching strategy

## Helpful Commands

```bash
# Dev server
bun dev

# Type check
bun check-types

# Build
bun build

# Test (khi có)
bun test

# Convex dashboard
# https://dashboard.convex.dev
```

## Liên hệ & Support

Xem `migration-plan.md` cho chi tiết kỹ thuật đầy đủ.
