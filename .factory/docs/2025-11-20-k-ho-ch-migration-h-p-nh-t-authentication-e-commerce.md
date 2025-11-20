# Kế hoạch Migration: Hợp nhất hệ thống Authentication & E-commerce

## Tổng quan
Chuyển đổi từ `students` sang `customers` thống nhất cho 3 loại sản phẩm: Khóa học, Tài nguyên/Plugin, và VFX.

## Phase 1: Database Migration

### 1.1. Bảng customers (thay thế students)
- Thêm `customerType` (individual/business/student)
- Thêm avatar và bio fields
- Giữ nguyên auth tokens và rate limiting

### 1.2. Bảng vfx_products
- Lưu video preview 1-5s trong storage
- Technical specs: resolution, frameRate, format, hasAlpha
- Category: explosion, fire, smoke, water, magic, particle, transition

### 1.3. Unified Orders System
- `productType`: course/resource/vfx/bundle
- Polymorphic `productId` reference
- Support nhiều payment methods

### 1.4. Customer Purchases (thay thế course_enrollments)
- Unified access control cho tất cả product types
- Track downloads cho resources & VFX
- Course progress tracking giữ nguyên

## Phase 2: Authentication Upgrade

### 2.1. CustomerAuthContext
- Thay thế StudentAuthContext
- Method `hasPurchased()` check quyền truy cập
- Support customer types và purchase history

### 2.2. Unified Header Component
- Thay CTA button bằng Login/Register hoặc Customer Menu
- Show customer type badge
- Quick links to purchases & downloads
- Dark mode toggle cho /khoa-hoc

## Phase 3: Implementation Steps (5 tuần)

**Week 1: Database**
- Backup & create new tables
- Migration scripts từ students → customers
- VFX products schema

**Week 2: Backend & Auth**
- Customer auth functions
- Unified order system
- Frontend CustomerAuthContext

**Week 3: UI Components**
- Refactor SiteHeaderSection
- VFX product pages
- Unified checkout flow

**Week 4: Features & Dark Mode**
- Payment integration
- Download center
- Dark mode cho /khoa-hoc

**Week 5: Migration & Testing**
- Run data migration
- Full testing suite
- Security audit & deploy

## Key Features

1. **Unified Authentication**
   - Một account cho tất cả sản phẩm
   - Customer types với benefits khác nhau
   
2. **Smart Header**
   - Context-aware auth buttons
   - Purchase status indicators
   - Dark/light mode support

3. **VFX Store**
   - Preview videos trực tiếp
   - Technical specs rõ ràng
   - Instant download sau purchase

4. **Order Management**
   - Multi-product cart
   - Coupon support
   - Invoice generation

## Migration Safety
- Full backup trước migration
- Test với small group first
- Rollback plan ready
- Zero downtime deployment

## Success Metrics
- Zero data loss
- < 2s page load
- 99.9% uptime
- Positive user feedback