# 📋 Kế hoạch chi tiết Phase 4: Admin Order Management

## 🎯 Mục tiêu
Hoàn thiện 100% quản lý đơn hàng cho Admin với nguyên tắc **KISS** và **MVP**.

## 📊 Trạng thái hiện tại

### ✅ Đã có (60%)
- **Orders List Page** (`/dashboard/orders/page.tsx`)
  - Hiển thị danh sách orders
  - Filter theo status (Pending | Paid | Activated)
  - Search theo order number
  - Nút "Xem" để vào detail page

### ❌ Chưa có (40%)
- **Order Detail Page** (`/dashboard/orders/[orderId]/page.tsx`)
- **Action Buttons** (Mark Paid, Activate, Cancel)
- **Customer Info Display**
- **Order Items Display**
- **Action Confirmations**

### ✅ Backend Ready (100%)
```typescript
// Tất cả functions đã có sẵn:
- getOrderWithItems(orderId) // Lấy order + items
- markOrderAsPaid(orderId, notes) // Đánh dấu đã thanh toán
- activateOrder(orderId) // Kích hoạt + tạo purchases
- cancelOrder(orderId, reason) // Hủy đơn
```

---

## 🛠️ Kế hoạch chi tiết (2-3 giờ)

### **STEP 1: Tạo Order Detail Page (45 phút)**

#### File: `apps/web/src/app/(dashboard)/dashboard/orders/[orderId]/page.tsx`

```typescript
// Cấu trúc component:
export default function OrderDetailPage({ params }) {
  const { orderId } = params;
  
  // 1. Fetch order with items
  const orderData = useQuery(api.orders.getOrderWithItems, { orderId });
  
  // 2. Fetch customer info
  const customer = orderData ? getCustomerInfo(orderData.customerId) : null;
  
  // 3. Display sections:
  return (
    <div>
      {/* Header với Order Number + Status Badge */}
      <OrderHeader order={orderData} />
      
      {/* Customer Info Card */}
      <CustomerInfoCard customer={customer} />
      
      {/* Order Items Table */}
      <OrderItemsTable items={orderData.items} />
      
      {/* Total & Actions */}
      <OrderSummary total={orderData.totalAmount} />
      <OrderActions order={orderData} />
    </div>
  );
}
```

**Sections cần implement:**
1. **Order Header**
   - Order number (DH-2411-001)
   - Status badge với màu sắc
   - Ngày tạo, cập nhật

2. **Customer Info**
   - Tên, Email, Phone
   - Hiện từ studentId (MVP approach)

3. **Items Table**
   - Product type (Course/Resource/VFX)
   - Product name
   - Price
   - Subtotal

4. **Action Buttons**
   - Conditional rendering theo status

---

### **STEP 2: Implement Action Buttons (30 phút)**

#### Component: `components/admin/OrderActions.tsx`

```typescript
interface OrderActionsProps {
  order: Order;
  onRefresh: () => void;
}

export function OrderActions({ order, onRefresh }) {
  const markPaidMutation = useMutation(api.orders.markOrderAsPaid);
  const activateMutation = useMutation(api.orders.activateOrder);
  const cancelMutation = useMutation(api.orders.cancelOrder);

  // Render buttons theo status
  if (order.status === 'pending') {
    return (
      <>
        <Button onClick={handleMarkPaid}>
          ✓ Đánh dấu đã thanh toán
        </Button>
        <Button variant="destructive" onClick={handleCancel}>
          ✕ Hủy đơn
        </Button>
      </>
    );
  }
  
  if (order.status === 'paid') {
    return (
      <Button onClick={handleActivate}>
        ⚡ Kích hoạt đơn hàng
      </Button>
    );
  }
  
  if (order.status === 'activated') {
    return <Badge>✓ Đã kích hoạt</Badge>;
  }
}
```

**Features:**
- Confirmation dialogs trước mỗi action
- Loading states
- Success/Error toasts
- Auto refresh sau action

---

### **STEP 3: Handle Customer Info (20 phút)**

#### Approach: Dùng studentId as customerId (MVP)

```typescript
// Trong OrderDetailPage:
const getCustomerInfo = async (customerId) => {
  // MVP: customerId thực ra là studentId
  try {
    // Try get as student first
    const student = await ctx.db.get(customerId as any);
    if (student) {
      return {
        type: 'student',
        name: student.fullName,
        email: student.email,
        phone: student.phone,
      };
    }
  } catch {
    // Fallback: show ID only
    return {
      type: 'unknown',
      id: customerId,
    };
  }
};
```

**Display:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Thông tin khách hàng</CardTitle>
  </CardHeader>
  <CardContent>
    <div>Tên: {customer.name || 'N/A'}</div>
    <div>Email: {customer.email || 'N/A'}</div>
    <div>SĐT: {customer.phone || 'N/A'}</div>
  </CardContent>
</Card>
```

---

### **STEP 4: Polish & Error Handling (25 phút)**

#### 4A. Confirmation Dialogs

```typescript
// Dùng shadcn/ui AlertDialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Example for Mark Paid
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button>Đánh dấu đã thanh toán</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Xác nhận thanh toán?</AlertDialogTitle>
      <AlertDialogDescription>
        Bạn xác nhận đã nhận được thanh toán cho đơn {order.orderNumber}?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Hủy</AlertDialogCancel>
      <AlertDialogAction onClick={confirmMarkPaid}>
        Xác nhận
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### 4B. Success/Error Handling

```typescript
// Sử dụng toast notifications
import { useToast } from "@/hooks/use-toast";

const handleActivate = async () => {
  try {
    setLoading(true);
    await activateMutation({ orderId });
    toast({
      title: "Thành công",
      description: "Đơn hàng đã được kích hoạt",
    });
    onRefresh(); // Refresh data
  } catch (error) {
    toast({
      title: "Lỗi",
      description: "Không thể kích hoạt đơn hàng",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

---

### **STEP 5: Testing & Integration (30 phút)**

#### Test Scenarios

**Test 1: View Order Detail**
```
1. Go to /dashboard/orders
2. Click "Xem" on any order
3. Verify shows:
   ✓ Order number & status
   ✓ Customer info
   ✓ Items list with prices
   ✓ Total amount
   ✓ Correct action buttons
```

**Test 2: Mark as Paid**
```
1. Find pending order
2. Click "Đánh dấu đã thanh toán"
3. Confirm dialog
4. Verify:
   ✓ Status changes to "paid"
   ✓ Success toast shows
   ✓ Button changes to "Kích hoạt"
```

**Test 3: Activate Order**
```
1. Find paid order
2. Click "Kích hoạt đơn hàng"  
3. Verify:
   ✓ Status changes to "activated"
   ✓ customer_purchases created
   ✓ Customer can access in /my-library
```

**Test 4: Cancel Order**
```
1. Find pending order
2. Click "Hủy đơn"
3. Enter reason
4. Verify:
   ✓ Order cancelled (notes updated)
   ✓ Cannot activate anymore
```

---

## 📝 Files cần tạo/sửa

| File | Action | Priority | Time |
|------|--------|----------|------|
| `orders/[orderId]/page.tsx` | CREATE | 🔴 HIGH | 45m |
| `components/admin/OrderActions.tsx` | CREATE | 🔴 HIGH | 20m |
| `components/admin/CustomerInfo.tsx` | CREATE | 🟡 MEDIUM | 15m |
| `components/admin/OrderItemsTable.tsx` | CREATE | 🟡 MEDIUM | 15m |
| `orders/page.tsx` | UPDATE (link to detail) | 🟢 LOW | 5m |
| Testing | TEST | 🟡 MEDIUM | 30m |

**Total: 2 hours 10 minutes**

---

## 🚫 Nguyên tắc KISS - KHÔNG làm

❌ **KHÔNG** implement edit order (chỉ view)
❌ **KHÔNG** implement refund flow  
❌ **KHÔNG** implement partial activation
❌ **KHÔNG** implement email notifications
❌ **KHÔNG** implement export to Excel/PDF
❌ **KHÔNG** làm phức tạp customer lookup

---

## ✅ Checklist Phase 4 

### Order Detail Page
- [ ] Shows order number & status
- [ ] Shows customer info
- [ ] Shows all items with prices
- [ ] Shows total amount
- [ ] Shows creation/update dates

### Action Buttons
- [ ] Pending → Show "Mark Paid" + "Cancel"
- [ ] Paid → Show "Activate"
- [ ] Activated → Show "Completed" badge
- [ ] All buttons have confirmation

### Actions Work
- [ ] Mark as Paid updates status
- [ ] Activate creates purchases
- [ ] Cancel updates notes
- [ ] All show success/error messages

### Integration
- [ ] Orders list links to detail
- [ ] Detail page has back button
- [ ] Data refreshes after actions
- [ ] No console errors

---

## 🎯 Definition of Done

Phase 4 được coi là **100% HOÀN THÀNH** khi:

1. ✅ Admin có thể xem chi tiết đơn hàng
2. ✅ Admin có thể mark as paid
3. ✅ Admin có thể activate (tạo purchases)  
4. ✅ Admin có thể cancel với reason
5. ✅ Tất cả actions có confirmation
6. ✅ Không có console errors
7. ✅ Data integrity maintained

---

## 📊 Code Structure

```
apps/web/src/
├── app/(dashboard)/dashboard/orders/
│   ├── page.tsx (✅ EXISTS)
│   └── [orderId]/
│       └── page.tsx (⏳ CREATE)
└── components/admin/
    ├── OrderActions.tsx (⏳ CREATE)
    ├── CustomerInfo.tsx (⏳ CREATE)
    └── OrderItemsTable.tsx (⏳ CREATE)
```

---

## 🧪 Test Commands

```bash
# Start dev
bun dev

# Navigate to orders
http://localhost:3001/dashboard/orders

# Test order detail
http://localhost:3001/dashboard/orders/[orderId]

# Check Convex for data
https://dashboard.convex.dev
```

---

## ⚡ Performance Tips

1. **Parallel queries** - Fetch order & customer cùng lúc
2. **Optimistic UI** - Update UI trước khi backend confirm
3. **Cache customer info** - Tránh fetch lại nhiều lần
4. **Lazy load dialogs** - Chỉ load khi cần

---

## 🎯 MVP Focus

**Làm:**
✅ View order details
✅ Basic actions (paid, activate, cancel)
✅ Simple customer display
✅ Clear status flow

**Không làm (để sau):**
❌ Edit order items
❌ Partial payments
❌ Discount application
❌ Email notifications
❌ Export features

---

Kế hoạch này đảm bảo **KISS**, **MVP**, và hoàn thành trong **2-3 giờ**. Bạn sẵn sàng thực hiện Phase 4?