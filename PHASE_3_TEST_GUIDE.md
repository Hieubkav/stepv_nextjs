# Phase 3 Testing Guide - Cart, Checkout & My Library

**Date:** 21/11/2025  
**Status:** Ready for Full Testing  
**Test Environment:** Local (http://localhost:3001)

---

## 🧪 Test Scenarios

### TEST 1: Cart System (Standalone)

**Objective:** Verify cart persists and calculates correctly

**Steps:**
```
1. Open http://localhost:3001/khoa-hoc
2. Add 1 course to cart
   ✓ Cart icon shows "1"
   ✓ LocalStorage stores item

3. Open DevTools (F12) → Application → Local Storage
   ✓ See key: "cart_items" with course data

4. Add another resource to cart
   ✓ Cart icon shows "2"
   ✓ LocalStorage updated

5. Close tab and reopen http://localhost:3001/khoa-hoc
   ✓ Cart still has 2 items (persisted)

6. Click cart icon → see CartDrawer
   ✓ Both items visible
   ✓ Prices correct
   ✓ Total price correct

7. Remove one item
   ✓ Cart updates to 1 item
   ✓ Total price recalculates
```

**Expected Result:** ✅ PASS
- Cart items persist in localStorage
- Item count updates correctly
- Total price calculates correctly

---

### TEST 2: Authentication Flow (Login/Register)

**Objective:** Verify StudentAuth works properly

**Steps:**
```
1. Go to http://localhost:3001/khoa-hoc/dang-ky
   ✓ Register page loads

2. Register new account
   Email: test@example.com
   Password: Test123!
   ✓ Account created
   ✓ Redirected to login or dashboard

3. Logout (click menu → Logout)
   ✓ Logged out

4. Go to /khoa-hoc/dang-nhap
   ✓ Login page loads

5. Login with credentials
   ✓ Logged in successfully
   ✓ Student profile loaded
   ✓ Profile shows name, email

6. Check localStorage
   ✓ Key: "learner.student.session" exists
   ✓ Contains student data + token
```

**Expected Result:** ✅ PASS
- Auth system works
- Student data persists
- Token saved in localStorage

---

### TEST 3: Checkout Flow (Most Important!)

**Objective:** Verify checkout process end-to-end

**Prerequisites:**
- User logged in
- Cart has 2-3 items

**Steps:**
```
STEP 1: Navigate to Checkout
1. Open http://localhost:3001
2. Go to /khoa-hoc (add 2 items to cart)
   ✓ Cart shows 2 items

3. Click cart icon → "Checkout" button
   ✓ Redirected to /checkout
   ✓ Page shows all items

STEP 2: Verify Checkout Page
4. Verify left side shows:
   ✓ Item 1: Course name + price
   ✓ Item 2: Resource name + price
   ✓ Total: Correct sum

5. Verify right side shows:
   ✓ Bank account info (ngân hàng A)
   ✓ "Thông tin của bạn" form section
   ✓ "Tạo đơn hàng" button

STEP 3: Fill Form
6. Fill checkout form:
   ✓ Full name: "Nguyễn Văn A"
   ✓ Email: "a@example.com" (disabled if from profile)
   ✓ Phone: "0901234567"

7. Click "Tạo đơn hàng"
   ✓ Loading indicator shows
   ✓ No errors in console

STEP 4: Success State
8. See success message with:
   ✓ Order number (format: DH-YYMM-XXX, e.g., DH-2411-001)
   ✓ Amount: Shows correct total
   ✓ Item count: "2 items"
   ✓ "Quay lại mua sắm" button

STEP 5: Verify Order Created
9. Go to Convex Dashboard
   https://dashboard.convex.dev
   → Data → orders
   ✓ New order exists
   ✓ Status: "pending"
   ✓ totalAmount: Correct
   ✓ orderNumber: Matches screen

10. Go to Data → order_items
    ✓ 2 items exist
    ✓ Both linked to order
    ✓ Prices correct

STEP 6: Verify Cart Cleared
11. Go back to http://localhost:3001/khoa-hoc
    ✓ Cart icon shows "0"
    ✓ localStorage "cart_items" empty
```

**Expected Result:** ✅ PASS
- Order created successfully
- Order number generated correctly
- Items saved to order_items
- Cart cleared after checkout

**If FAILS:**
```
- Check console for errors
- Verify student is logged in
- Check Convex dashboard for order creation
- Look for issues in orders.ts backend function
```

---

### TEST 4: Admin Activation Flow

**Objective:** Verify admin can mark order as paid and activate

**Steps:**
```
STEP 1: Find Pending Order
1. Go to Convex Dashboard
   https://dashboard.convex.dev
   → Data → orders

2. Find order with status "pending"
   (Should be the one just created)
   ✓ See order number DH-2411-XXX
   ✓ See totalAmount
   ✓ Status: "pending"

STEP 2: Mark as Paid
3. Click on the order row
   ✓ Order details open

4. Edit order
   ✓ Change status: "pending" → "paid"
   ✓ Save

5. Verify status changed
   ✓ Order now shows status: "paid"

STEP 3: Activate Order
6. In Convex Dashboard, go to Functions
   → packages/backend/convex/orders.ts
   → activateOrder

7. Run function with orderId
   ✓ Function executes successfully
   ✓ No errors

STEP 4: Verify Purchases Created
8. Go to Data → customer_purchases
   ✓ 2 new records exist
   ✓ Both linked to same order
   ✓ customerId matches student
   ✓ productType: "course" and "resource"
   ✓ productId: Correct IDs

9. Go back to orders
   ✓ Order status: "activated"
   ✓ updatedAt: Latest timestamp
```

**Expected Result:** ✅ PASS
- Order activation works
- customer_purchases created for each item
- Order status transitions: pending → paid → activated

**If FAILS:**
```
- Check activateOrder function in orders.ts
- Verify order exists with correct customerId
- Check order_items were created
- Look for JavaScript errors in Convex logs
```

---

### TEST 5: My Library Page

**Objective:** Verify library shows purchased items

**Prerequisites:**
- Order activated (purchases created)
- User logged in

**Steps:**
```
STEP 1: Navigate to Library
1. Go to http://localhost:3001/my-library
   ✓ Page loads
   ✓ No errors

STEP 2: Check Tabs
2. Verify 3 tabs visible:
   ✓ 🎓 Khóa học (with count badge)
   ✓ 📦 Tài nguyên (with count badge)
   ✓ ✨ VFX (with count badge)

STEP 3: Verify Items Show
3. Click "Khóa học" tab
   ✓ Shows 1 course card
   ✓ Course name visible
   ✓ Progress bar visible (0%)
   ✓ Click course → opens course detail

4. Click "Tài nguyên" tab
   ✓ Shows 1 resource card
   ✓ Resource name visible
   ✓ Download button visible
   ✓ Download count: 0

5. If any VFX in order:
   Click "✨ VFX" tab
   ✓ Shows VFX card
   ✓ VFX name visible
   ✓ Preview button visible
   ✓ Download button visible

STEP 4: Test Download (Resources/VFX)
6. Click download button on resource
   ✓ Download starts (check browser)
   ✓ Increment download count works

STEP 5: Test Course Access
7. Click on course card
   ✓ Opens course detail page
   ✓ User can watch lessons
   ✓ Progress bar increments (if watching)

STEP 6: Empty State
8. Add a VFX to cart but don't checkout
   ✓ My Library VFX tab still empty
   ✓ Empty state message shows correctly

9. Buy the VFX, activate order
   ✓ VFX appears in library
```

**Expected Result:** ✅ PASS
- My Library shows 3 tabs
- Purchased items appear in correct tabs
- Download works
- Course access works
- Empty states show correctly

**If FAILS:**
```
- Check if purchases query returns data
- Verify student is logged in
- Check Convex getCustomerLibrary function
- Look for errors when enriching purchases with product details
```

---

### TEST 6: End-to-End Flow (Complete)

**Objective:** Test entire flow from browsing to accessing library

**Duration:** ~15 minutes  
**Requires:** Fresh account (or clear data)

**Flow:**
```
1. CREATE NEW ACCOUNT
   /khoa-hoc/dang-ky
   ✓ Email: test-e2e@example.com
   ✓ Password: Test123!
   ✓ Full name: "Test User"

2. BROWSE PRODUCTS
   /khoa-hoc
   ✓ Add 1 course to cart

   /thu-vien
   ✓ Add 1 resource to cart

   /vfx (if exists)
   ✓ Add 1 VFX to cart

3. CHECKOUT
   /checkout
   ✓ Form pre-filled with profile data
   ✓ Create order
   ✓ Get order number (e.g., DH-2411-001)

4. ADMIN ACTIVATION (Convex Dashboard)
   ✓ Mark order as paid
   ✓ Activate order
   ✓ Create purchases

5. ACCESS LIBRARY
   /my-library
   ✓ See 3 items in library
   ✓ Access course (view lessons)
   ✓ Download resource
   ✓ Download VFX (if added)

6. VERIFY DATA
   Convex Dashboard:
   ✓ 1 order (activated)
   ✓ 3 order_items
   ✓ 3 customer_purchases
   ✓ Download count incremented for resources
```

**Expected Result:** ✅ PASS - Full flow works end-to-end

---

## ✅ Checklist: Phase 3 Complete

### Cart System
- [ ] Items persist in localStorage
- [ ] Add/remove works
- [ ] Total calculates correctly
- [ ] Cart clears after checkout

### Authentication
- [ ] Login works
- [ ] Register works
- [ ] Student profile loads
- [ ] Token persists

### Checkout Page
- [ ] Page loads when user logged in
- [ ] Redirects to login if not authenticated
- [ ] Shows all cart items
- [ ] Shows total price
- [ ] Shows bank info
- [ ] Form validates
- [ ] Order created successfully
- [ ] Order number displays
- [ ] Success state shows

### Admin Activation
- [ ] Mark as paid works
- [ ] Activate order works
- [ ] customer_purchases created
- [ ] Status transitions correctly

### My Library
- [ ] Page loads
- [ ] 3 tabs visible
- [ ] Purchased items show
- [ ] Download button works
- [ ] Download count increments
- [ ] Course access works
- [ ] Empty states correct

### Data Integrity
- [ ] Orders table has correct data
- [ ] order_items linked correctly
- [ ] customer_purchases created
- [ ] studentId used as customerId
- [ ] No orphaned records

### Error Handling
- [ ] Empty cart shows message
- [ ] Not logged in redirects
- [ ] Network errors handled
- [ ] Invalid data handled
- [ ] No console errors

---

## 🐛 Known Issues & Workarounds

### Issue: TypeScript Errors in Backend
**Cause:** Old schema fields referenced  
**Impact:** No runtime impact, just type checking  
**Workaround:** Will be fixed after Phase 3 cleanup

### Issue: studentId cast as customerId
**Cause:** Students table used instead of customers  
**Impact:** Works at runtime, type safety warning  
**Workaround:** Temporary for MVP, full migration in v2

### Issue: Download doesn't actually download
**Cause:** Backend not implemented  
**Impact:** Download button shows but no file  
**Workaround:** Test with console checks, not actual file download

---

## 🚀 Testing Commands

```bash
# Start dev servers
bun dev

# Access app
http://localhost:3001

# Convex dashboard
https://dashboard.convex.dev

# Browser DevTools
F12 → Network/Console/Application

# Check localStorage
F12 → Application → Local Storage → http://localhost:3001
```

---

## 📊 Test Results Template

```
Test Date: __________
Tester: __________
Environment: Local

| Test Case | Status | Notes |
|-----------|--------|-------|
| TEST 1: Cart | PASS/FAIL | _________ |
| TEST 2: Auth | PASS/FAIL | _________ |
| TEST 3: Checkout | PASS/FAIL | _________ |
| TEST 4: Activation | PASS/FAIL | _________ |
| TEST 5: Library | PASS/FAIL | _________ |
| TEST 6: E2E | PASS/FAIL | _________ |

Issues Found:
- _________ 
- _________

Sign-off: _________
```

---

## Next: Phase 4 Testing

After Phase 3 passes all tests:
- Order list page (/dashboard/orders)
- Order detail page (/dashboard/orders/[id])
- Order actions (Mark Paid, Activate, Cancel)
- Admin workflow testing

---

**Last Updated:** 21/11/2025  
**Next Update:** After testing phase complete
