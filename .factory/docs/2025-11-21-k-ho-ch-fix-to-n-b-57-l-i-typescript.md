# 🔧 KẾ HOẠCH FIX TOÀN BỘ 57 LỖI TYPESCRIPT

## 📊 Phân tích lỗi theo file

| File | Số lỗi | Nguyên nhân chính |
|------|--------|-------------------|
| **payments.ts** | 37 | courseId, studentId, amount fields |
| **customers.ts** | 7 | avatar, bio, customerType, tags fields |
| **vfx.ts** | 5 | priceAmount, index issues |
| **coupons.ts** | 4 | studentId, courseId, amount fields |
| **analytics.ts** | 3 | amount, courseId fields |
| **orders.ts** | 1 | getOrderWithItems call syntax |
| **TOTAL** | **57** | |

---

## 🛠️ KẾ HOẠCH CHI TIẾT FIX TỪNG FILE

### **FILE 1: customers.ts (7 lỗi)**
```typescript
// Lỗi: avatar, bio, customerType, tags không còn trong schema

// Line 47-51 - Xóa các fields không tồn tại:
const toPublicCustomer = (customer: CustomerDoc): PublicCustomer => ({
    _id: customer._id,
    account: customer.account,
    email: customer.email,
    fullName: customer.fullName,
    phone: customer.phone ?? undefined,
    // XÓA: avatar: customer.avatar ?? undefined,
    // XÓA: bio: customer.bio ?? undefined,
    // XÓA: customerType: customer.customerType,
    notes: customer.notes ?? undefined,
    // XÓA: tags: customer.tags ?? [],
    order: customer.order,
    active: customer.active,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
});

// Line 107 - Xóa filter by customerType:
if (customerType) {
    // COMMENT OUT hoặc XÓA
    // customers = customers.filter((item) => item.customerType === customerType);
}

// Line 118 - Xóa tags trong search:
const values = [
    item.account,
    item.fullName,
    item.email,
    item.phone ?? "",
    // XÓA: item.tags?.join(" ") ?? "",
];
```

---

### **FILE 2: analytics.ts (3 lỗi)**
```typescript
// Line 48 - Sửa amount → totalAmount:
const totalRevenue = payments.reduce((sum, payment) => {
    const order = allOrders.find((o) => o._id === payment.orderId);
    // SỬA: return sum + (order?.amount || 0);
    return sum + (order?.totalAmount || 0);
}, 0);

// Line 58-59 - Xử lý courseId từ order_items:
for (const payment of payments) {
    const order = allOrders.find((o) => o._id === payment.orderId);
    if (order) {
        // Cần lấy từ order_items table
        const orderItems = await ctx.db
            .query("order_items")
            .withIndex("by_order", (q) => q.eq("orderId", order._id))
            .collect();
        
        for (const item of orderItems) {
            if (item.productType === "course") {
                const courseId = item.productId;
                revenueByCategory[courseId] = 
                    (revenueByCategory[courseId] || 0) + item.price;
            }
        }
    }
}
```

---

### **FILE 3: coupons.ts (4 lỗi)**
```typescript
// Line 381 - Sửa studentId → customerId:
if (order.customerId !== args.studentId) {
    throw new Error("Đơn hàng không thuộc về bạn");
}

// Line 388-389 - Xử lý courseId và amount:
// Cần lấy từ order_items
const orderItems = await ctx.db
    .query("order_items")
    .withIndex("by_order", (q) => q.eq("orderId", order._id))
    .first(); // Lấy item đầu tiên (giả sử 1 course)

const validation = await ctx.runQuery(api.coupons.validateCoupon, {
    code: coupon.code,
    courseId: orderItems?.productId, // Lấy từ order_items
    amount: order.totalAmount, // Dùng totalAmount
    studentId: args.studentId,
});

// Line 416 - Sửa amount → totalAmount:
return {
    useId,
    discountAmount,
    newTotal: Math.max(0, order.totalAmount - discountAmount),
};
```

---

### **FILE 4: orders.ts (1 lỗi)**
```typescript
// Line 137 - Sửa cách gọi getOrderWithItems:
// Không gọi như function trong mutation context
const orderWithItems = await ctx.db.get(orderId);
if (!orderWithItems) return null;

const items = await ctx.db
    .query("order_items")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .collect();

return { ...orderWithItems, items };
```

---

### **FILE 5: vfx.ts (5 lỗi)**
```typescript
// Line 131 - Sửa priceAmount → price:
await ctx.db.patch(args.id, {
    // SỬA: priceAmount: args.priceAmount,
    price: args.price,
    // Các fields khác...
});

// Line 261 & 270 - Sửa index references:
// XÓA queries dùng index "by_vfx" (không tồn tại)
// Thay bằng:
const purchases = await ctx.db
    .query("customer_purchases")
    .filter((q) => 
        q.and(
            q.eq(q.field("productType"), "vfx"),
            q.eq(q.field("productId"), id.toString())
        )
    )
    .collect();

const orders = await ctx.db
    .query("orders")
    .collect()
    .then(orders => {
        // Filter orders có vfx item
        return orders.filter(async (order) => {
            const items = await ctx.db
                .query("order_items")
                .withIndex("by_order", q => q.eq("orderId", order._id))
                .collect();
            return items.some(item => 
                item.productType === "vfx" && 
                item.productId === id.toString()
            );
        });
    });
```

---

### **FILE 6: payments.ts (37 lỗi - PHỨC TẠP NHẤT)**

#### Các patterns sửa chung:
1. **studentId → customerId** (nhiều chỗ)
2. **courseId → lấy từ order_items**
3. **amount → totalAmount**
4. **Index "by_student" → không tồn tại**

```typescript
// Line 41-42 - Sửa index query:
// XÓA dòng dùng "by_student"
const orders = await ctx.db
    .query("orders")
    .filter((q) => 
        q.eq(q.field("customerId"), studentId as any)
    )
    .collect();

// Line 54 - Sửa status check:
// "cancelled" không có trong union type mới
// Thay bằng check notes field
if (order.notes?.includes("Cancelled")) {
    throw new Error("Order đã bị hủy");
}

// Line 66 - Sửa insert order:
const orderId = await ctx.db.insert("orders", {
    customerId: studentId as any, // Cast tạm
    orderNumber: generateOrderNumber(), // Cần thêm function
    totalAmount: amount,
    status: "pending",
    notes: undefined,
    createdAt: now,
    updatedAt: now,
});

// Line 118, 136-138, 143, etc - Pattern chung:
// Mọi chỗ dùng order.courseId → cần query order_items:
const orderItems = await ctx.db
    .query("order_items")
    .withIndex("by_order", (q) => q.eq("orderId", order._id))
    .collect();

const courseItem = orderItems.find(item => item.productType === "course");
const courseId = courseItem ? courseItem.productId : null;

// Line 180-184 - Fix media references:
// course.thumbnailMediaId → course.thumbnailId (check schema)
// Hoặc skip nếu không có

// Các lỗi còn lại tương tự - apply patterns trên
```

---

## ⏱️ THỜI GIAN ƯỚC TÍNH

| File | Thời gian | Độ khó |
|------|-----------|--------|
| customers.ts | 15 phút | ⭐ Dễ |
| analytics.ts | 20 phút | ⭐⭐ Trung bình |
| coupons.ts | 20 phút | ⭐⭐ Trung bình |
| orders.ts | 10 phút | ⭐ Dễ |
| vfx.ts | 25 phút | ⭐⭐ Trung bình |
| payments.ts | 60 phút | ⭐⭐⭐ Khó |
| **TOTAL** | **2.5 giờ** | |

---

## 📋 STEP-BY-STEP IMPLEMENTATION

### **Bước 1: Backup hiện tại** (5 phút)
```bash
# Backup các files cần sửa
cp convex/customers.ts convex/customers.ts.bak
cp convex/analytics.ts convex/analytics.ts.bak
# ... các file khác
```

### **Bước 2: Fix từng file theo thứ tự** (2.5 giờ)
1. **customers.ts** - Xóa fields không tồn tại
2. **orders.ts** - Fix getOrderWithItems 
3. **analytics.ts** - Update field names & logic
4. **coupons.ts** - Update references
5. **vfx.ts** - Fix indexes & field names
6. **payments.ts** - Major refactor

### **Bước 3: Test** (30 phút)
```bash
# Enable lại typecheck
bun dev # Không có --typecheck=disable

# Verify không còn lỗi
bun check-types
```

### **Bước 4: Run test flows** (30 phút)
- Test cart → checkout → library
- Test admin panel
- Verify data integrity

---

## ✅ EXPECTED OUTCOME

Sau khi fix xong:
- ✅ 0 TypeScript errors
- ✅ Dev server chạy clean
- ✅ Production-ready code
- ✅ All features working
- ✅ Type safety restored

---

## 🎯 BẮT ĐẦU FIX?

Tôi sẽ fix theo thứ tự:
1. **Easy wins first** (customers, orders) - 25 phút
2. **Medium complexity** (analytics, coupons, vfx) - 1 giờ  
3. **Complex** (payments) - 1 giờ

**Total: ~2.5 giờ để fix clean toàn bộ 57 lỗi**

Bạn muốn tôi bắt đầu fix không?