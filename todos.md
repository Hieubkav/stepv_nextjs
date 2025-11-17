# 📚 DOHY - Web Khóa Học Hoàn Chỉnh - Danh Sách Công Việc

**Status:** Lập kế hoạch MVP
**Mục tiêu:** Xây dựng nền tảng khóa học trực tuyến hoàn chỉnh với KISS principle
**Ngôn ngữ:** Next.js 15 + Convex + React 19
**Deadline:** -

---

## 🎯 Tóm Tắt Tính Năng

Web khóa học DOHY sẽ có quy trình sau:
1. **Học viên:** Đăng ký → Đăng nhập → Xem danh sách khóa → Mua khóa (VietQR) → Xác nhận thanh toán → Học tập → Hoàn thành + Nhận chứng chỉ
2. **Admin:** Nhận email mua khóa → Xác nhận QR → Tự động thêm học viên → Duyệt tiến độ → Phát chứng chỉ
3. **Tiến độ:** Tự động lưu điểm xem, cho phép tiếp tục từ bài cuối

---

## 📋 TIER 1: CRITICAL (Thanh Toán & Access Control)

### ✅ 1.0 - Authentication: OTP Email Recovery (Forgot Password)
- [ ] Tạo table `otp_tokens` (studentId, otpCode, email, expiresAt, usedAt, attempts)
  - otpCode: 6 chữ số (ví dụ: 123456)
  - expiresAt: 15 phút từ lúc tạo
  - attempts: max 3 lần nhập sai
- [ ] Update table `students`: thêm field `lastOtpSentAt` (rate limiting: max 1 OTP/5 phút)
- [ ] Backend function: `requestPasswordResetOTP(email)`
  - Generate 6-digit OTP
  - Lưu vào DB với expiry 15 phút
  - Gửi email OTP qua Resend
  - Rate limit: max 3 request/hour per email
  - Return message: "OTP đã gửi, check email của bạn"
- [ ] Backend function: `verifyOTPAndResetPassword(email, otpCode, newPassword)`
  - Kiểm tra OTP hợp lệ (chưa hết hạn, không bị sử dụng)
  - Kiểm tra attempts < 3 (nếu hết attempt thì block 30 phút)
  - Update password trực tiếp (không dùng reset token nữa)
  - Mark OTP as used
  - Return success: "Mật khẩu đã được đặt lại"
- [ ] Backend function: `validateOTP(otpCode, email)` - Check OTP validity
- [ ] Gửi email OTP template qua Resend
- [ ] Frontend: Tạo route `/khoa-hoc/reset-password-otp` (thay thế reset-password page cũ)
  - Step 1: Nhập email → "Gửi mã OTP"
  - Step 2: Nhập OTP (6 chữ số) + mật khẩu mới
  - Step 3: Confirm → back to login
  - Show timer: "OTP hết hạn trong X phút"
  - Show attempts: "Còn X lần nhập"
  - Error message: "OTP không hợp lệ", "OTP đã hết hạn", "Bạn đã nhập sai quá nhiều lần"
- [ ] Optional: Resend OTP button (sau 60 giây)

### ✅ 1.1 - Database: Tạo Tables Thanh Toán
- [ ] Tạo table `orders` (studentId, courseId, amount, status, paymentMethod, notes, createdAt, updatedAt)
- [ ] Tạo table `payments` (orderId, qrCode, studentName, bankAccount, transactionId, status, paidAt, verifiedAt, verifiedByAdminId)
- [ ] Tạo table `payment_confirmations` (paymentId, studentId, adminId, screenshotUrl, confirmedAt, notes)
- [ ] Thêm index: orders by_student, by_course, by_status
- [ ] Thêm index: payments by_status, by_verified

### ✅ 1.2 - Backend: Tạo Convex Functions Thanh Toán
- [ ] `createOrder(studentId, courseId)` - Tạo đơn hàng mới
- [ ] `getOrder(orderId)` - Lấy chi tiết đơn hàng
- [ ] `listStudentOrders(studentId)` - Danh sách đơn hàng học viên
- [ ] `updateOrderStatus(orderId, status)` - Cập nhật trạng thái (pending, paid, completed)
- [ ] `generateVietQRCode(amount, accountNumber, accountName)` - Sinh QR code từ VietQR API
- [ ] `recordPayment(orderId, qrCodeData, studentProof)` - Lưu chứng minh thanh toán
- [ ] `adminConfirmPayment(paymentId, verified, notes)` - Admin xác nhận thanh toán
- [ ] `adminRejectPayment(paymentId, reason)` - Admin từ chối thanh toán
- [ ] Thêm hook: khi `payment.status === 'confirmed'` → tạo enrollment + gửi email

### ✅ 1.3 - Backend: Cấu Hình Ngân Hàng & VietQR
- [ ] Thêm setting: `bank_account_number` (lưu vào settings table)
- [ ] Thêm setting: `bank_account_name` (tên chủ tài khoản)
- [ ] Thêm setting: `bank_code` (ví dụ: VIETCOMBANK, AGRIBANK)
- [ ] Tạo function `generateQRCode(amount)` - Call VietQR API
  - VietQR endpoint: `https://api.vietqr.io/account`
  - Params: `accountNo`, `accountName`, `acqId`, `amount`, `addInfo`
  - Response: QR code image URL
- [ ] Xử lý error VietQR: invalid account, timeout, etc.

### ✅ 1.4 - Frontend: Tạo Checkout Page
- [ ] Tạo route: `/khoa-hoc/[courseOrder]/checkout`
- [ ] Hiển thị: Tên khóa, giá, thông tin thanh toán
- [ ] Nút "Mua ngay" → Tạo order → Hiển thị QR code
- [ ] Học viên copy thông tin thanh toán (tài khoản, số tiền, nội dung)
- [ ] Upload screenshot chứng minh thanh toán
- [ ] Tự động check status thanh toán (polling 5s)
- [ ] Hiển thị status: Chờ xác nhận, Đã xác nhận, Bị từ chối

### ✅ 1.5 - Frontend: Admin Payment Dashboard
- [ ] Tạo route: `/dashboard/payments`
- [ ] Danh sách payment chờ xác nhận (status = pending)
- [ ] Hiển thị: Học viên, khóa, số tiền, QR, screenshot
- [ ] Nút "Xác nhận thanh toán" → Update status → Auto add enrollment
- [ ] Nút "Từ chối & yêu cầu thanh toán lại" → Gửi email
- [ ] Filter: by status, by date, by amount
- [ ] Search: by student name, by course

### ✅ 1.6 - Kiểm Soát Access Khóa Trả Phí
- [ ] Middleware: Kiểm tra enrollment trước khi xem bài học
- [ ] Nếu `course.pricingType === 'paid'` + không có enrollment → redirect checkout
- [ ] Nếu `course.pricingType === 'paid'` + enrollment.status !== 'confirmed' → redirect payment page
- [ ] Hiển thị preview: nội dung intro, 1-2 bài preview (isPreview = true)
- [ ] Ẩn YouTube URL cho học viên không có quyền
- [ ] Toast message: "Bạn cần mua khóa này để tiếp tục"

### ✅ 1.7 - Update Enrollment Status
- [ ] Thêm field: `enrollment.status` (free, pending, active, completed, expired)
- [ ] Thêm field: `enrollment.enrolledAt`, `enrollment.completedAt`
- [ ] Thêm field: `enrollment.paidAmount` (lưu giá thanh toán)
- [ ] Update query: `getCourseForLearner` - check status trước return data

### ✅ 1.8 - Email Notification: Mua Khóa
- [ ] Email cho học viên: "Yêu cầu mua khóa đã gửi, chờ admin xác nhận"
- [ ] Email cho admin: "Học viên XXX muốn mua khóa YYY, số tiền ZZZ VND - Chờ xác nhận"
- [ ] Email: Học viên thanh toán bị từ chối → Yêu cầu thanh toán lại
- [ ] Email: Thanh toán được xác nhận → Link vào học khóa

---

## 📋 TIER 2: IMPORTANT (Certificate + Quiz + Tiến Độ)

### ✅ 2.1 - Database: Quản Lý Tiến Độ Chi Tiết
- [x] Tạo table `lesson_completions` (studentId, lessonId, completedAt, watchTimeSeconds, lastWatchedAt)
- [x] Thêm field: `enrollment.completedAt`, `enrollment.completionPercentage`
- [x] Thêm index: lesson_completions by_student_lesson, by_student_course

### ✅ 2.2 - Backend: Functions Tiến Độ
- [x] `recordLessonView(studentId, lessonId, watchTime)` - Ghi nhận xem bài
- [x] `completeLessonIfDone(studentId, lessonId)` - Đánh dấu hoàn thành nếu xem đủ (80% thời lượng)
- [x] `getEnrollmentProgress(studentId, courseId)` - Lấy tiến độ chi tiết
- [x] `getLearnerStats(studentId)` - Thống kê: tổng giờ học, số khóa hoàn thành, v.v.
- [x] Auto-mark complete: nếu progress = 100% → có thể phát chứng chỉ

### ✅ 2.3 - Database: Certificate
- [x] Tạo table `certificates` (studentId, courseId, certificateCode, issuedAt, expiresAt)
- [x] Thêm field: unique certificateCode (format: DOHY-2024-XXXXX)

### ✅ 2.4 - Backend: Certificate Functions
- [x] `issueCertificate(studentId, courseId)` - Phát chứng chỉ khi hoàn thành
- [x] `getCertificateByCode(code)` - Xác minh chứng chỉ
- [x] `downloadCertificate(certificateId)` - Generate PDF chứng chỉ
  - Template: Logo DOHY, tên học viên, khóa học, ngày phát, chữ ký
- [x] Trigger: Khi `enrollment.completionPercentage >= 100%` → tự động phát

### ✅ 2.5 - Frontend: Certificate Page
- [x] Tạo route: `/dashboard/certificates`
- [x] Danh sách chứng chỉ của học viên
- [x] Nút "Xem PDF", "Chia sẻ", "In"
- [x] Hiển thị: Khóa, ngày phát, mã chứng chỉ

### ✅ 2.6 - Database: Quiz System
- [x] Tạo table `course_quizzes` (courseId, chapterId, title, description, order, passingScore)
- [x] Tạo table `quiz_questions` (quizId, questionText, questionType (multiple_choice/short_answer), options array, correctAnswer, order)
- [x] Tạo table `quiz_attempts` (studentId, quizId, answers array, score, passed, submittedAt, reviewedAt)

### ✅ 2.7 - Backend: Quiz Functions
- [x] `getQuizDetail(quizId)` - Lấy đề quiz (không show đáp án)
- [x] `submitQuizAnswers(studentId, quizId, answers)` - Submit bài
- [x] `gradeQuiz(quizId, answers)` - Tính điểm (50 điểm = 5/10 câu đúng)
- [x] `getQuizResult(attemptId)` - Lấy kết quả (có show đáp án)
- [x] `getQuizStatistics(quizId)` - Thống kê: tỉ lệ pass, điểm trung bình
- [x] Không cho pass nếu score < passingScore

### ✅ 2.8 - Frontend: Quiz UI
- [ ] Tạo quiz player component
- [ ] Hiển thị: câu hỏi, options (radio button hoặc checkbox)
- [ ] Timer (optional): hiếu hành nếu có`timeLimit`
- [ ] Submit button → Grade → Show result
- [ ] Hiển thị: "Bạn đạt X/Y điểm - PASS/FAIL"
- [ ] Review: show đáp án đúng vs học viên trả lời

### ✅ 2.9 - Integrate Quiz vào Course Lesson
- [ ] Thêm quiz trước/sau bài học
- [ ] Bắt buộc hoàn thành quiz (score >= passing) mới tính xong bài?
- [ ] Hoặc optional: chỉ nhập liệu, không bắt pass

### ✅ 2.10 - Progress Tracking UI
- [x] Update learner dashboard: show progress bar per chapter
- [x] Dropdown chapter: list lessons + completion status (✓/✗)
- [x] "Continue learning" button → jump to last viewed lesson
- [x] Timeline: show progress history (optional)

---

## 📋 TIER 3: ENHANCEMENT (Engagement Features)

### ✅ 3.1 - Database: Comments & Discussions
- [ ] Tạo table `comments` (studentId, courseId, lessonId, parentCommentId, content, createdAt, updatedAt, deletedAt)
- [ ] Tạo table `comment_likes` (studentId, commentId)

### ✅ 3.2 - Backend: Comment Functions
- [ ] `createComment(studentId, lessonId, content, parentId?)` - Bình luận
- [ ] `listLessonComments(lessonId)` - Danh sách bình luận (nested)
- [ ] `deleteComment(commentId, studentId)` - Xóa (chỉ chủ sở hữu)
- [ ] `likeComment(studentId, commentId)` - Like bình luận
- [ ] `getCommentCount(lessonId)` - Số bình luận

### ✅ 3.3 - Frontend: Comment Section
- [ ] Component bình luận trong lesson page
- [ ] Hiển thị: tên học viên, nội dung, thời gian, like count
- [ ] Hỗ trợ reply (nested comments)
- [ ] Xóa comment của chính mình
- [ ] Like/unlike

### ✅ 3.4 - Database: Course Reviews
- [ ] Tạo table `course_reviews` (studentId, courseId, rating 1-5, title, content, helpful_count, createdAt, updatedAt)
- [ ] Tạo table `review_helpful` (studentId, reviewId, isHelpful true/false)

### ✅ 3.5 - Backend: Review Functions
- [ ] `createReview(studentId, courseId, rating, title, content)` - Post review
- [ ] `updateReview(reviewId, rating, title, content)` - Update review
- [ ] `listCourseReviews(courseId)` - Danh sách review (sort by helpful)
- [ ] `markReviewHelpful(studentId, reviewId, isHelpful)` - Mark helpful/not
- [ ] `getCourseRating(courseId)` - Trung bình rating + count reviews

### ✅ 3.6 - Frontend: Review UI
- [ ] Tab "Reviews" trên course detail page
- [ ] Hiển thị: average rating (⭐), count reviews, distribution
- [ ] Form: write review (5-star, title, content)
- [ ] List reviews: sort by "Most helpful", "Newest"
- [ ] "Helpful?" button → +1 helpful count

### ✅ 3.7 - Database: Notifications
- [ ] Tạo table `notifications` (studentId, type, title, message, link, isRead, createdAt)
- [ ] Type: order_confirmed, payment_rejected, certificate_issued, new_comment_reply, course_updated

### ✅ 3.8 - Backend: Notification Functions
- [ ] `createNotification(studentId, type, title, message, link)` - Create
- [ ] `listNotifications(studentId, limit=20)` - List (unread first)
- [ ] `markAsRead(notificationId)` - Mark read
- [ ] `deleteNotification(notificationId)` - Delete
- [ ] `getUnreadCount(studentId)` - Count unread

### ✅ 3.9 - Frontend: Notification Center
- [ ] Bell icon ở header (show unread count)
- [ ] Dropdown: top 5 notifications
- [ ] Link: "See all" → notification page
- [ ] Notification page: list all, filter by type, mark read/delete
- [ ] Real-time: subscribe to notifications (Convex subscription)

### ✅ 3.10 - Email on Notification
- [ ] Email khi có reply comment
- [ ] Email khi course updated (new lesson)
- [ ] Email khi certificate issued
- [ ] Preference: User có thể turn off email notifications

### ✅ 3.11 - Database: Coupons & Promotions
- [ ] Tạo table `coupons` (code, discountPercent, discountFixed, maxUses, usedCount, expiresAt, minAmount, appliesTo, createdAt)
- [ ] appliesTo: 'all_courses', 'specific_courses' array, 'specific_users'
- [ ] Tạo table `coupon_uses` (couponId, studentId, orderId, appliedAt)

### ✅ 3.12 - Backend: Coupon Functions
- [ ] `validateCoupon(code, courseId?, amount?)` - Check valid + return discount
- [ ] `applyCoupon(studentId, orderId, couponCode)` - Apply coupon
- [ ] `getCouponStats(couponId)` - Used count, revenue saved

### ✅ 3.13 - Frontend: Coupon UI
- [ ] Checkout page: input coupon code
- [ ] Validate on blur → show discount amount
- [ ] Update total price
- [ ] Error: "Coupon invalid/expired/used up"

---

## 📋 TIER 4: POLISH & OPTIMIZATION

### ✅ 4.1 - Course Categories
- [ ] Tạo table `course_categories` (name, slug, description, icon, order)
- [ ] Thêm field: `courses.categoryId`
- [ ] Update course list: filter by category

### ✅ 4.2 - Advanced Search & Filter
- [ ] Search courses: by title, description
- [ ] Filter: by category, by price (free/paid), by rating
- [ ] Sort: by newest, most popular, highest rated, price (asc/desc)
- [ ] Pagination: 12 courses per page

### ✅ 4.3 - Learner Dashboard Stats
- [ ] Tạo `/dashboard/stats` (hoặc `/dashboard/my-courses` expand)
- [ ] Card: Total courses, Completed courses, In progress, Hours learned
- [ ] Chart: Learning activity (last 7 days)
- [ ] Card: Certificates earned
- [ ] Card: Average rating given by learner

### ✅ 4.4 - Instructor Profiles
- [ ] Tạo table `instructors` (name, bio, avatar, email, socialLinks)
- [ ] Thêm field: `courses.instructorIds` array
- [ ] Tạo route: `/instructors/[slug]`
- [ ] Danh sách khóa của instructor

### ✅ 4.5 - Wishlist improvements
- [ ] Hiện tại: chỉ có `yeu-thich` page
- [ ] Thêm: "Save for later" email reminder
- [ ] Thêm: export wishlist (PDF/CSV)

### ✅ 4.6 - Admin Analytics Dashboard
- [ ] Revenue: Total, This month, Per course
- [ ] Students: New, Active, Completed courses
- [ ] Enrollment rate: per course
- [ ] Top courses: by revenue, by enrollments
- [ ] Chart: Revenue trend (last 12 months)
- [ ] Chart: Student acquisition

### ✅ 4.7 - Email Templates Improvements
- [ ] Tạo HTML templates cho tất cả email
- [ ] Course recommendation email (weekly)
- [ ] Course reminder: "Bạn chưa hoàn thành khóa XXX - Tiếp tục học"
- [ ] Survey email: Review feedback

### ✅ 4.8 - Security & Compliance
- [ ] Password requirements: min 8 chars, uppercase, number
- [ ] 2FA (2-factor authentication) - optional
- [ ] GDPR: Data export, account deletion
- [ ] Audit logs: admin actions

### ✅ 4.9 - Localization (i18n)
- [ ] Setup next-intl (if needed)
- [ ] Translations: EN, VI
- [ ] Admin panel: language switcher
- [ ] RTL support (if Arabic, etc.)

### ✅ 4.10 - Performance Optimization
- [ ] Image optimization: next/image, WebP
- [ ] Code splitting: lazy load heavy components
- [ ] Caching: HTTP cache headers
- [ ] CDN: upload media to CDN (if budget allows)

---

## 🔧 DATABASE CHANGES SUMMARY

### New Tables (22 tables total, +9 new)
```
Current: 13 tables
+ orders
+ payments
+ payment_confirmations
+ lesson_completions
+ certificates
+ course_quizzes
+ quiz_questions
+ quiz_attempts
+ comments
+ comment_likes
+ course_reviews
+ review_helpful
+ notifications
+ coupons
+ coupon_uses
+ instructors
+ course_categories
+ audit_logs (optional)
```

### Schema Update Script Needed
- [ ] Run schema.ts update
- [ ] Add new tables
- [ ] Add new fields to existing tables (enrollment.status, courses.categoryId, etc.)
- [ ] Create indexes
- [ ] Migration: seed admin user if not exists

---

## 🎨 FRONTEND PAGES NEEDED

### New Learner Pages
- [ ] `/khoa-hoc/[courseOrder]/checkout` - Checkout page
- [ ] `/dashboard/my-courses` - My courses dashboard
- [ ] `/dashboard/certificates` - Certificate list
- [ ] `/dashboard/stats` - Learning statistics
- [ ] `/dashboard/notifications` - Notifications page

### New Admin Pages
- [ ] `/dashboard/payments` - Payment confirmation dashboard
- [ ] `/dashboard/settings/bank` - Bank account settings
- [ ] `/dashboard/analytics` - Revenue & student analytics
- [ ] `/dashboard/categories` - Course categories management

### Update Existing Pages
- [ ] Update `/khoa-hoc/[courseOrder]` - Add course detail (reviews, comments, instructor)
- [ ] Update `/dashboard/courses` - Add category selector
- [ ] Update learner course list - Add filter, search, sort
- [ ] Update lesson player - Add comments section

---

## 📧 EMAIL TEMPLATES

- [ ] `welcome-email.html` - Already have
- [ ] `password-reset.html` - Already have (keep for backward compatibility)
- [ ] `otp-email.html` - NEW: Gửi mã OTP 6 chữ số
  - Hiển thị OTP code to nhất (font-size: 32px, monospace)
  - Hạn sử dụng: 15 phút
  - Warning: không chia sẻ mã này
- [ ] `order-confirmation.html` - NEW
- [ ] `payment-request-to-admin.html` - NEW
- [ ] `payment-confirmed.html` - NEW
- [ ] `payment-rejected.html` - NEW
- [ ] `certificate-issued.html` - NEW
- [ ] `course-recommendation.html` - NEW (optional)

---

## 🧪 TESTING CHECKLIST

### Authentication - OTP Password Reset
- [ ] Request OTP: nhập email → email received
- [ ] OTP valid: 6 chữ số, 15 phút hạn
- [ ] OTP expire: sau 15 phút → error "OTP hết hạn"
- [ ] OTP rate limit: max 3 request/hour → error "Yêu cầu quá nhiều, thử lại sau 1 giờ"
- [ ] OTP max attempts: max 3 lần nhập sai → block 30 phút
- [ ] Verify OTP: nhập đúng OTP + mật khẩu mới → success
- [ ] Set new password: có thể login với mật khẩu mới
- [ ] Resend OTP button: chỉ active sau 60 giây

### Payment Flow
- [ ] Student mua khóa, tạo order
- [ ] QR code sinh đúng
- [ ] Student upload screenshot
- [ ] Admin xác nhận
- [ ] Enrollment tự động tạo
- [ ] Student được access khóa

### Access Control
- [ ] Free course: access ngay
- [ ] Paid course chưa mua: show preview, redirect checkout
- [ ] Paid course đã mua: full access
- [ ] Student khác không vào được

### Progress Tracking
- [ ] Watch lesson → recordLessonView
- [ ] Progress updated
- [ ] Continue learning: go to last viewed
- [ ] Complete course → 100% progress
- [ ] Certificate auto-issued

### Quiz
- [ ] Submit quiz → grade
- [ ] Score calculation correct
- [ ] Pass/fail logic
- [ ] Can retake quiz

### Notifications
- [ ] Get notification on subscribe
- [ ] Mark as read
- [ ] Real-time update (Bell icon)

---

## 📝 IMPLEMENTATION PRIORITY

### Phase 1 (Critical - Must have MVP)
1. Tier 1: Payment system + VietQR + Access control
2. Enrollment status update
3. Email notifications for payments

### Phase 2 (Essential)
1. Tier 2: Certificate system
2. Quiz system
3. Detailed progress tracking

### Phase 3 (Highly recommended)
1. Tier 3: Comments, reviews, notifications

### Phase 4 (Nice to have)
1. Tier 4: Analytics, categories, optimization

---

## 🎯 SUCCESS CRITERIA

✅ Student can: Register → Login → Browse courses → Buy course via VietQR → Learn → Get certificate

✅ Admin can: Manage courses → Confirm payments → Track student progress → Export revenue

✅ System: Auto-enroll on payment, track progress, issue certificates, send emails

✅ Security: Protected paid content, audit logs, data validation

---

## 📞 NOTES & QUESTIONS

- VietQR integration: Cần test API key
- Certificate PDF generation: Dùng library nào? (html2pdf, pdfkit, jsPDF)
- Email sending: Resend + SMTP setup check
- Payment webhook: Nếu dùng gateway thì cần webhook handler
- Database migration: Convex có schema versioning?
- Backup strategy: Convex backup policy?

---

**Last updated:** 2025-11-17
**Status:** Ready for implementation
**Total tasks:** ~150 tasks across 4 tiers
