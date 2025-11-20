# MVP E-commerce - Final Plan

## Core Changes

### 1. Multi-item Orders
- NEW `order_items` table
- Order number: DH-2411-001 (short & clean)
- Manual payment verification (bank transfer)

### 2. Simplified Schema
- customers: Remove customerType, avatar, bio
- orders: Remove paymentMethod (admin checks manually)
- vfx_products: Add proper pricing fields
- purchases: Lifetime access (no expiry)

### 3. Implementation (3 weeks)

**Week 1: Database & Backend**
- Add order_items table
- Create orders.ts with multi-item support
- Simplify customers.ts
- Fix vfx pricing

**Week 2: Frontend**
- Cart system
- Checkout with bank info display
- My Library page (3 tabs)

**Week 3: Admin & Testing**
- Order management panel
- Activate orders → Create purchases
- Full flow testing

## Key Features
✅ Multi-item cart
✅ Short order numbers (DH-2411-001)
✅ Manual payment (bank transfer)
✅ Lifetime access
✅ Simple download counter
✅ Duplicate purchase warnings

## Benefits
- User: Buy multiple items at once
- Admin: Familiar manual process
- Dev: Simple to build & extend