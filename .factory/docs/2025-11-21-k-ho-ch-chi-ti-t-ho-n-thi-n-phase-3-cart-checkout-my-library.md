# 📋 Kế hoạch hoàn thiện Phase 3 (Cart, Checkout & My Library) - 100%

## 🎯 Mục tiêu
Hoàn thiện 100% Phase 3 với nguyên tắc **KISS** và **MVP**: Fix auth mismatch, kết nối đúng backend, test flow hoàn chỉnh.

## 📊 Trạng thái hiện tại Phase 3: 85%

### ✅ Đã có (85%)
- **Cart System** (100%): CartContext, CartIcon, CartDrawer, CartItem
- **Checkout Page** (90%): UI hoàn chỉnh, form validation, bank info
- **My Library Page** (90%): UI hoàn chỉnh, 3 tabs, empty states
- **Library Components** (100%): CourseCard, ResourceCard, VfxCard

### ❌ Vấn đề cần fix (15%)
1. **Auth Mismatch**: Checkout và My Library dùng `useCustomerAuth` nhưng system dùng `useStudentAuth`
2. **Backend Mismatch**: purchases API expect `customerId` nhưng ta có `studentId`
3. **Chưa test**: Flow hoàn chỉnh từ cart → checkout → library

## 🛠️ Kế hoạch chi tiết (2-3 giờ)

### **STEP 1: Fix Authentication (30 phút)**

#### 1A. Update Checkout Page
```typescript
// File: apps/web/src/app/(site)/checkout/page.tsx
// Thay đổi:
- import { useCustomerAuth } from '@/features/auth';
+ import { useStudentAuth } from '@/features/learner/auth';

- const { customer, status } = useCustomerAuth();
+ const { student, status } = useStudentAuth();

// Update order creation:
- customerId: customer._id
+ customerId: student._id as any  // Tạm cast, sẽ fix backend sau
```

#### 1B. Update CheckoutForm Component
```typescript
// File: apps/web/src/components/checkout/CheckoutForm.tsx
- import { useCustomerAuth } from '@/features/auth';
+ import { useStudentAuth } from '@/features/learner/auth';

- const { customer } = useCustomerAuth();
+ const { student } = useStudentAuth();

// Update form defaults:
- fullName: customer?.fullName || '',
+ fullName: student?.fullName || '',
```

#### 1C. Update My Library Page  
```typescript
// File: apps/web/src/app/(site)/my-library/page.tsx
- import { useCustomerAuth } from '@/features/auth';
+ import { useStudentAuth } from '@/features/learner/auth';

- const { customer, status } = useCustomerAuth();
+ const { student, status } = useStudentAuth();

// Update query:
- customerId: customer._id
+ customerId: student._id as any  // Tạm cast
```

---

### **STEP 2: Adapt Backend cho Students (45 phút)**

#### Option A: Quick Fix (Recommended cho MVP) ✅
Tạo wrapper functions map students → customers tạm thời:

```typescript
// File: packages/backend/convex/orders.ts
// Thêm function mới:
export const createOrderForStudent = mutation({
    args: {
        studentId: v.id("students"),
        items: v.array(v.object({
            productType: v.string(),
            productId: v.string(),
            title: v.string(),
            price: v.number(),
        }))
    },
    handler: async (ctx, { studentId, items }) => {
        // Tạo temporary customerId từ studentId
        const tempCustomerId = studentId as any;
        
        // Gọi existing createOrder với customerId
        return await createOrderWithItems(ctx, {
            customerId: tempCustomerId,
            items
        });
    }
});
```

```typescript
// File: packages/backend/convex/purchases.ts
// Thêm wrapper:
export const getStudentLibrary = query({
    args: { studentId: v.id("students") },
    handler: async (ctx, { studentId }) => {
        // Map studentId → customerId tạm
        const tempCustomerId = studentId as any;
        
        // Query purchases với customerId
        const purchases = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer", q => q.eq("customerId", tempCustomerId))
            .collect();
            
        // Enrich với product details
        const enriched = await Promise.all(
            purchases.map(async (p) => {
                let product = null;
                if (p.productType === 'course' && p.courseId) {
                    product = await ctx.db.get(p.courseId);
                }
                // ... similar for resources, vfx
                return { ...p, product };
            })
        );
        
        return enriched;
    }
});
```

#### Option B: Full Migration (Time-consuming) ❌
- Migrate toàn bộ students → customers table
- Update tất cả references
- Risk cao, không recommend cho MVP

---

### **STEP 3: Connect Frontend với Backend mới (30 phút)**

#### 3A. Update Checkout để dùng student API
```typescript
// File: apps/web/src/app/(site)/checkout/page.tsx

// Import student-specific mutation
const createOrderMutation = useMutation(api.orders.createOrderForStudent);

// Update submit handler:
const order = await createOrderMutation({
    studentId: student._id,  // Dùng studentId trực tiếp
    items: orderItems,
});
```

#### 3B. Update My Library để dùng student API
```typescript
// File: apps/web/src/app/(site)/my-library/page.tsx

// Query student library
const purchases = useQuery(
    student ? api.purchases.getStudentLibrary : null,
    student ? { studentId: student._id } : 'skip'
);
```

---

### **STEP 4: Testing Flow Hoàn Chỉnh (30 phút)**

#### 4A. Test Cart → Checkout
```bash
1. Clear localStorage (F12 → Application → Clear)
2. Go to /khoa-hoc
3. Add 2-3 items to cart
4. Verify cart icon shows count
5. Open cart drawer - verify items
6. Click "Checkout"
7. Verify redirect if not logged in
8. Login at /khoa-hoc/dang-nhap
9. Return to /checkout
10. Fill form and submit
11. Verify order number shows (DH-2411-XXX)
```

#### 4B. Test Admin Activation (mock)
```typescript
// Tạm thời test bằng Convex dashboard:
1. Open https://dashboard.convex.dev
2. Go to Data → orders
3. Find order với status "pending"
4. Edit: status → "paid"
5. Run function: activateOrder(orderId)
6. Verify: customer_purchases created
```

#### 4C. Test My Library
```bash
1. Go to /my-library
2. Verify 3 tabs hiển thị
3. Verify purchased items show
4. Test CourseCard - click vào course
5. Test ResourceCard - download button
6. Test VfxCard - preview + download
7. Verify download counter increments
```

---

### **STEP 5: Polish & Edge Cases (30 phút)**

#### 5A. Error Handling
```typescript
// Thêm try-catch và error messages:
try {
    const order = await createOrderMutation({...});
} catch (error) {
    toast.error("Không thể tạo đơn hàng. Vui lòng thử lại.");
    console.error('Order creation failed:', error);
}
```

#### 5B. Loading States  
```typescript
// Thêm loading indicators:
{isLoading && (
    <div className="animate-spin">...</div>
)}
```

#### 5C. Empty States
```typescript
// Verify empty states work:
- Cart empty → Show "Giỏ hàng trống"
- Library empty → Show CTA buttons
- No purchases → Show "Chưa mua gì"
```

---

## 📝 Files cần sửa

| File | Changes | Priority | Time |
|------|---------|----------|------|
| `checkout/page.tsx` | CustomerAuth → StudentAuth | 🔴 HIGH | 10m |
| `CheckoutForm.tsx` | CustomerAuth → StudentAuth | 🔴 HIGH | 5m |
| `my-library/page.tsx` | CustomerAuth → StudentAuth | 🔴 HIGH | 10m |
| `orders.ts` | Add createOrderForStudent() | 🔴 HIGH | 15m |
| `purchases.ts` | Add getStudentLibrary() | 🔴 HIGH | 15m |
| Frontend connections | Update API calls | 🟡 MEDIUM | 20m |
| Testing | Full flow test | 🟡 MEDIUM | 30m |

**Total: 1h 45m** (có thể nhanh hơn nếu không gặp issues)

---

## 🚫 Nguyên tắc KISS - KHÔNG làm

❌ **KHÔNG** migrate database (students → customers)  
❌ **KHÔNG** implement payment gateway  
❌ **KHÔNG** thêm discount/coupon system  
❌ **KHÔNG** làm subscription model  
❌ **KHÔNG** optimize performance (sau MVP)  

---

## ✅ Checklist hoàn thành Phase 3

### Authentication Fixed
- [ ] Checkout dùng StudentAuth
- [ ] My Library dùng StudentAuth
- [ ] Login flow works end-to-end

### Backend Adapted
- [ ] createOrderForStudent() works
- [ ] getStudentLibrary() returns data
- [ ] Purchases created on activation

### UI Components Working
- [ ] Cart persists in localStorage
- [ ] Checkout creates order
- [ ] Order number displays
- [ ] My Library shows purchases
- [ ] Download buttons work

### Testing Complete
- [ ] Can add items to cart
- [ ] Can checkout when logged in
- [ ] Can see order in admin
- [ ] Can activate order (creates purchases)
- [ ] Can see items in My Library
- [ ] Can download items

---

## 🎯 Definition of Done

Phase 3 được coi là **100% HOÀN THÀNH** khi:

1. ✅ User có thể: Browse → Add to Cart → Checkout → Get Order Number
2. ✅ Admin có thể: See Order → Mark as Paid → Activate
3. ✅ User có thể: See in Library → Download/Access
4. ✅ Không có console errors
5. ✅ Auth flow consistent (StudentAuth everywhere)
6. ✅ Data persists correctly (cart, orders, purchases)

---

## 🚀 Next Steps sau Phase 3

Khi Phase 3 hoàn thành 100%, chuyển sang **Phase 4: Admin Order Management**:
1. Order detail page với full info
2. Action buttons (Mark Paid, Activate, Cancel)
3. Order history và filters
4. Dashboard widgets

**Estimate Phase 4:** 2-3 giờ

---

Kế hoạch này đảm bảo **KISS**, **MVP**, và **ship nhanh**. Bạn ready để thực hiện?