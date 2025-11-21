# Kế hoạch Fix Phase 3 & Triển khai Phase 4

## 🔴 VẤN ĐỀ HIỆN TẠI

### Phase 3 Issues:
1. **Authentication Mismatch**
   - Checkout dùng CustomerAuthContext
   - Login dùng StudentAuthContext 
   - Không có customer login/register page
   - ⚠️ Checkout bị lỗi "Vui lòng đăng nhập" vì không có customer

2. **Admin Order Page Outdated**
   - `/dashboard/order/page.tsx` dùng old schema (studentId, courseId)
   - Không hỗ trợ multi-item orders
   - Cần làm lại hoàn toàn

## ✅ GIẢI PHÁP

### Option 1: QUICK FIX (Recommended for MVP)
**Giữ students table, update checkout để dùng students**

#### Files cần sửa:
1. **checkout/page.tsx**
   - Đổi từ useCustomerAuth → useStudentAuth
   - Tạo temporary customerId từ studentId

2. **orders.ts** (backend)
   - Thêm function createOrderFromStudent()
   - Map studentId → customerId tạm

3. **CheckoutForm.tsx**
   - Dùng student info thay vì customer

### Option 2: FULL MIGRATION (Time-consuming)
- Migrate toàn bộ students → customers
- Update tất cả auth flows
- Risk: Break existing features

## 📋 PHASE 4: Admin Order Management

### Files tạo mới:

#### 1. `/dashboard/orders/page.tsx` (NEW - multi-item support)
```typescript
// List orders với filters
- Pending orders (chờ thanh toán)
- Paid orders (đã thanh toán)
- Activated orders (đã kích hoạt)
- Search by order number
- Filter by date range
```

#### 2. `/dashboard/orders/[orderId]/page.tsx`
```typescript
// Order detail với items
- Order info (number, date, status)
- Customer info (name, email, phone)
- Items list (courses, resources, vfx)
- Total amount
- Actions: Mark as Paid, Activate, Cancel
```

#### 3. Components:
- `OrdersTable.tsx` - Danh sách orders
- `OrderActions.tsx` - Buttons: Paid/Activate/Cancel
- `OrderItems.tsx` - Chi tiết items trong order
- `OrderStatusBadge.tsx` - Status display

## 🔄 IMPLEMENTATION STEPS

### Step 1: Fix Checkout (30 mins)
```typescript
// checkout/page.tsx
- import { useStudentAuth } from '@/features/learner/auth'
- const { student } = useStudentAuth()
- Create temp customerId or use studentId
```

### Step 2: Update Backend (30 mins)
```typescript
// orders.ts
createOrderWithStudentId({
  studentId, // Use student for now
  items: [...]
})
```

### Step 3: Admin Orders List (1 hour)
```typescript
// /dashboard/orders/page.tsx
- Tabs: Pending | Paid | Activated
- Table with columns: Order#, Date, Customer, Items, Amount, Status, Actions
- Quick actions: Mark Paid, Activate
```

### Step 4: Order Detail Page (1 hour)
```typescript
// /dashboard/orders/[orderId]/page.tsx
- Full order details
- Items breakdown
- Customer info
- Action buttons with confirmation
```

### Step 5: Order Actions (30 mins)
```typescript
// Mark as Paid button
await markOrderAsPaid(orderId, notes)

// Activate button
await activateOrder(orderId)
→ Creates customer_purchases
→ Grants access
```

## 📊 UI MOCKUP

### Orders List Page
```
Dashboard > Orders

[🔍 Search by order number...]  [Filter: All Status ▼] [Date Range ▼]

Pending (3) | Paid (2) | Activated (15)

┌─────────────────────────────────────────────────────────────┐
│ Order#      Date       Customer    Items  Amount    Actions │
├─────────────────────────────────────────────────────────────┤
│ DH-2411-001 20/11     Nguyễn A    3      500K     [Paid][✓]│
│ DH-2411-002 21/11     Trần B      1      200K     [Paid][✓]│
│ DH-2411-003 21/11     Lê C        2      300K     [Paid][✓]│
└─────────────────────────────────────────────────────────────┘
```

### Order Detail Page
```
Order: DH-2411-001

Status: [Pending] → [Mark as Paid] [Activate] [Cancel]

Customer:
- Name: Nguyễn Văn A
- Email: a@gmail.com  
- Phone: 0901234567

Items (3):
1. 🎓 React Course - 300,000đ
2. 📦 Icon Pack - 100,000đ  
3. ✨ Fire VFX - 100,000đ

Total: 500,000đ

Notes: [________________] [Save]
```

## ⏱️ TIME ESTIMATE

- Fix Phase 3: 1 hour
- Phase 4 Admin: 3 hours
- Testing: 1 hour
- **Total: 5 hours**

## 🎯 PRIORITY

1. **HIGH**: Fix checkout authentication
2. **HIGH**: Admin orders list page
3. **MEDIUM**: Order detail page
4. **LOW**: Advanced filters/search

Chọn Option 1 (Quick Fix) hay Option 2 (Full Migration)?