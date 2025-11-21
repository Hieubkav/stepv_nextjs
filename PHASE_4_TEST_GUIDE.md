# Phase 4 Testing Guide - Admin Order Management

**Date:** 21/11/2025  
**Status:** Ready for Testing  
**Test Duration:** ~30-45 minutes  
**Test Environment:** Local (http://localhost:3001)

---

## 🧪 Test Scenarios

### TEST 1: View Order Detail Page

**Objective:** Verify order detail page displays all information correctly

**Prerequisites:**
- Dev server running
- Have at least 1 order in database (from Phase 3)

**Steps:**

```
1. Go to http://localhost:3001/dashboard/orders
   ✓ Orders list page loads
   ✓ See table with multiple orders

2. Click "Xem" button on any order
   ✓ Navigated to /dashboard/orders/[orderId]
   ✓ No console errors

3. Verify Order Header Section
   ✓ Back button visible and clickable
   ✓ Order number displays (e.g., "Đơn hàng DH-2411-001")
   ✓ Order title shows correctly
   ✓ Creation date displays (e.g., "Tạo ngày: 21/11/2025")
   ✓ Status badge shows with correct color:
      - Yellow: "Chờ thanh toán" (Pending)
      - Blue: "Đã thanh toán" (Paid)
      - Green: "Đã kích hoạt" (Activated)

4. Verify Left Column (Order Details)
   ✓ "Thông tin đơn hàng" card shows:
      - Mã đơn hàng: {orderNumber}
      - Trạng thái: {status}
      - Ngày tạo: {date}
      - Cập nhật lúc: {date}

5. Verify Customer Info Card
   ✓ "Thông tin khách hàng" card shows:
      - Mã học viên: {customerId}
      - MVP note about studentId

6. Verify Items Table
   ✓ Shows "Sản phẩm trong đơn ({count})"
   ✓ Table headers: #, Loại, Mã sản phẩm, Giá
   ✓ Each item row shows:
      - Sequential number
      - Product type badge (🎓 Khóa học, 📦 Tài nguyên, ✨ VFX)
      - Product ID (formatted as code)
      - Price in VND format

7. Verify Right Column (Summary & Actions)
   ✓ Total amount displays large (e.g., "400,000 VND")
   ✓ Item count shows
   ✓ Action buttons visible (based on status)

8. Test Back Navigation
   ✓ Click "Quay lại" button
   ✓ Returns to orders list
   ✓ Same filter/search preserved if possible
```

**Expected Result:** ✅ PASS
- All information displays correctly
- Layout is clean and organized
- No console errors

**If FAILS:**
```
Check:
1. Order exists in Convex database
2. Browser console for errors (F12)
3. Verify api.orders.getOrderWithItems works
4. Check order.items populated
```

---

### TEST 2: Mark Order as Paid

**Objective:** Verify admin can mark pending order as paid

**Prerequisites:**
- Pending order exists (status: "pending")
- On order detail page

**Steps:**

```
1. From pending order detail page
   ✓ See yellow badge: "Chờ thanh toán"
   ✓ See info box: "Chờ thanh toán: Bạn cần xác nhận..."
   ✓ Button text: "✓ Đánh dấu đã thanh toán"

2. Click "✓ Đánh dấu đã thanh toán" button
   ✓ Confirmation dialog appears
   ✓ Dialog title: "Xác nhận thanh toán?"
   ✓ Dialog shows order number
   ✓ Dialog shows total amount
   ✓ Two buttons: "Hủy" and "Xác nhận"

3. Click "Xác nhận" button
   ✓ Dialog closes
   ✓ Loading spinner appears briefly
   ✓ No errors in console

4. Verify Success
   ✓ Toast notification shows: "Thành công - Đơn hàng DH-XXXX-XXX đã được đánh dấu đã thanh toán"
   ✓ Page auto-refreshes
   ✓ Status badge changes to blue: "Đã thanh toán"
   ✓ Button changes to: "⚡ Kích hoạt đơn hàng"
   ✓ Info box changes to blue: "Đã thanh toán: Hãy kích hoạt đơn hàng..."

5. Verify in Convex Dashboard
   ✓ Go to https://dashboard.convex.dev
   ✓ Data → orders
   ✓ Find the order
   ✓ Status changed to "paid"
   ✓ notes field updated with timestamp
```

**Expected Result:** ✅ PASS
- Status transitions from pending → paid
- UI updates automatically
- Toast confirmation shows
- Convex database updated

**If FAILS:**
```
Check:
1. API call api.orders.markOrderAsPaid works
2. Browser console for errors
3. Convex mutation logs
4. Toast hook working properly
5. Page refresh happening
```

---

### TEST 3: Activate Order (Critical!)

**Objective:** Verify admin can activate paid order and create purchases

**Prerequisites:**
- Paid order exists (status: "paid")
- On order detail page of paid order

**Steps:**

```
1. From paid order detail page
   ✓ See blue badge: "Đã thanh toán"
   ✓ See blue info box about activation
   ✓ Button text: "⚡ Kích hoạt đơn hàng"

2. Click "⚡ Kích hoạt đơn hàng" button
   ✓ Confirmation dialog appears
   ✓ Dialog title: "Kích hoạt đơn hàng?"
   ✓ Dialog shows what will happen:
      - "Tạo quyền truy cập cho X sản phẩm"
      - "Khách hàng có thể xem trong 'Thư viện của tôi'"
      - "Cho phép download/truy cập ngay lập tức"
   ✓ Buttons: "Hủy" and "Xác nhận kích hoạt"

3. Click "Xác nhận kích hoạt" button
   ✓ Dialog closes
   ✓ Loading indicator shows
   ✓ No errors in console

4. Verify Success
   ✓ Toast shows: "Thành công - Đơn hàng DH-XXXX-XXX đã được kích hoạt..."
   ✓ Status badge changes to green: "Đã kích hoạt"
   ✓ Buttons disappear
   ✓ Info box changes to green: "✓ Đã hoàn thành..."
   ✓ Shows: "Khách hàng có thể truy cập sản phẩm trong 'Thư viện của tôi'"

5. Verify in Convex Dashboard
   ✓ Data → orders
   ✓ Order status: "activated"
   ✓ updatedAt: latest timestamp

6. Verify Purchases Created
   ✓ Go to Data → customer_purchases
   ✓ Filter by customerId (should match student._id)
   ✓ See N new records (where N = number of items)
   ✓ Each purchase has:
      - customerId: matches order
      - orderId: matches order
      - productType: course/resource/vfx
      - productId: correct ID
      - createdAt: timestamp

7. Verify Customer Can Access
   ✓ Login as customer
   ✓ Go to /my-library
   ✓ See purchased items in correct tabs
   ✓ Can access course/download resources
```

**Expected Result:** ✅ PASS
- Order status: pending → paid → activated
- Customer purchases created for each item
- Customer can access in My Library

**If FAILS:**
```
Check:
1. activateOrder() mutation works
2. Order has items
3. Customer purchases created
4. customerId matches
5. No duplicate purchases
6. Browser console errors
```

---

### TEST 4: Error Handling

**Objective:** Verify system handles errors gracefully

**Steps:**

```
1. Try Activate Pending Order (Should Fail)
   ✓ On pending order page
   ✓ If somehow button shows, try to click activate
   ✓ Should fail with error: "Order must be paid before activation"
   ✓ Toast shows: "Lỗi - Không thể kích hoạt đơn hàng"
   ✓ Order doesn't change status

2. Try Cancel Order
   ✓ Find pending order
   ✓ Click "✕ Hủy đơn hàng" button
   ✓ Confirmation dialog
   ✓ Dialog warns: "Hành động này không thể hoàn tác"
   ✓ Click confirm
   ✓ Toast shows: "Thành công - Đơn hàng... đã được hủy"
   ✓ Check order in Convex: notes updated with "Hủy..."

3. Try Invalid Order ID
   ✓ Go to /dashboard/orders/invalid-id
   ✓ See loading state briefly
   ✓ Then see "Không tìm thấy đơn hàng" message
   ✓ Button to "Quay lại danh sách"

4. Network Error Simulation
   ✓ Open DevTools → Network tab
   ✓ Throttle to "Slow 3G"
   ✓ Try to mark as paid
   ✓ Should complete (or timeout with error)
   ✓ Toast shows result
```

**Expected Result:** ✅ PASS
- All errors handled gracefully
- User sees friendly messages
- No app crashes
- Console shows helpful errors

---

### TEST 5: End-to-End Admin Workflow

**Objective:** Complete admin workflow from list to activation

**Duration:** ~10 minutes  
**Requires:** Fresh pending order

**Flow:**

```
1. Go to /dashboard/orders
   ✓ See order list
   ✓ Find pending order

2. Click "Xem" on pending order
   ✓ Order detail loads

3. Verify shows pending status
   ✓ Yellow badge
   ✓ Correct buttons

4. Click "✓ Đánh dấu đã thanh toán"
   ✓ Confirm dialog
   ✓ Click confirm
   ✓ Success toast

5. Verify status changed to paid
   ✓ Blue badge
   ✓ Button changed to activate

6. Click "⚡ Kích hoạt đơn hàng"
   ✓ Confirm dialog shows explanation
   ✓ Click confirm
   ✓ Success toast

7. Verify status changed to activated
   ✓ Green badge
   ✓ "Đã hoàn thành" message

8. Verify customer can access
   ✓ Login as customer with matching ID
   ✓ Go to /my-library
   ✓ See purchased items

9. Verify downloads work
   ✓ Try to download resource
   ✓ Should work or show appropriate message
```

**Expected Result:** ✅ PASS
- Complete workflow from pending to activated
- Customer gains access
- All systems work together

---

## ✅ Checklist: All Tests Pass

### Functionality
- [ ] View order detail page
- [ ] Display all order information
- [ ] Show customer info
- [ ] Show items table
- [ ] Mark as paid works
- [ ] Activate order works
- [ ] Cancel order works
- [ ] Status transitions correct

### UI/UX
- [ ] Buttons properly labeled
- [ ] Confirmation dialogs clear
- [ ] Status badges color-coded
- [ ] Loading states show
- [ ] Error messages friendly
- [ ] Success messages clear
- [ ] Layout responsive
- [ ] Navigation works

### Data Integrity
- [ ] Orders update correctly
- [ ] Purchases created on activation
- [ ] No duplicate purchases
- [ ] customerId matches
- [ ] Order items preserved
- [ ] Timestamps correct

### Error Handling
- [ ] Invalid order shows message
- [ ] API errors handled
- [ ] Network errors handled
- [ ] User can retry
- [ ] No app crashes

---

## 🐛 Known Issues & Workarounds

### Issue: Customer info shows ID only
**Cause:** MVP approach - using studentId as customerId
**Workaround:** Check Convex Dashboard for full student info
**Timeline:** Fix in v2.0 with full customers table

### Issue: Cancel doesn't actually delete
**Cause:** Design choice - soft delete (mark in notes)
**Workaround:** Manual cleanup in Convex Dashboard if needed
**Timeline:** Consider hard delete in v2.0

---

## 🎯 Test Results

**Date:** __________  
**Tester:** __________  
**Environment:** Local

| Test # | Scenario | Status | Notes |
|--------|----------|--------|-------|
| 1 | View Order Detail | [ ] PASS [ ] FAIL | _________ |
| 2 | Mark as Paid | [ ] PASS [ ] FAIL | _________ |
| 3 | Activate Order | [ ] PASS [ ] FAIL | _________ |
| 4 | Error Handling | [ ] PASS [ ] FAIL | _________ |
| 5 | E2E Workflow | [ ] PASS [ ] FAIL | _________ |

**Overall Result:** [ ] ALL PASS [ ] SOME FAIL

**Issues Found:**
- ________
- ________

**Sign-off:** __________

---

## 🚀 After Testing

If all tests pass:
1. ✅ Mark Phase 4 as complete
2. ✅ MVP is 100% ready
3. ✅ Proceed with final launch preparation

If issues found:
1. ⚠️ Document issues clearly
2. ⚠️ Prioritize critical vs nice-to-have
3. ⚠️ Fix and re-test

---

**Last Updated:** 21/11/2025  
**Ready to Test:** YES ✅
