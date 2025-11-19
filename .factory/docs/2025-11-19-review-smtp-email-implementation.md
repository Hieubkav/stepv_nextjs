## Kế hoạch Review Code SMTP Implementation

### 1. **Kiểm tra Cấu Hình SMTP & Error Handling** 🔍
- Verify nodemailer transport configuration đúng với Gmail
- Kiểm tra secure: false cho port 587 (TLS)
- Review error handling trong sendEmailViaSMTP
- Kiểm tra getTransporter có validate đủ biến môi trường
- Xem xét thêm retry logic cho network failures

### 2. **Review Tất Cả Email Functions** ✉️
- Confirm 9 functions đã chuyển sang sendEmailViaSMTP:
  - sendPasswordResetEmail ✓
  - sendWelcomeEmail ✓
  - sendOTPEmail ✓
  - sendPaymentRequestToAdminEmail ✓
  - sendPaymentReceivedEmail ✓
  - sendPaymentConfirmedEmail ✓
  - sendPaymentRejectedEmail ✓
  - sendOrderPlacedEmail ✓
  - sendCourseOnboardingEmail ✓
- Check không còn reference đến Resend
- Verify HTML templates không bị ảnh hưởng

### 3. **Security & Environment Variables** 🔐
- Verify SMTP_PASSWORD được bảo mật (App Password, không phải password thường)
- Check biến môi trường trên cả local và production
- Confirm không có sensitive data trong logs
- Review fromAddress format: `"Dohy" <hieubkav8@gmail.com>`

### 4. **Test Thực Tế** 🧪
Test các scenarios chính:
- Register user mới → sendWelcomeEmail
- Request password reset → sendOTPEmail
- Place order → sendOrderPlacedEmail
- Payment confirmation → sendPaymentConfirmedEmail
- Check email có vào inbox hay spam folder

### 5. **TypeScript & Dependencies** 📦
- Verify nodemailer import đúng
- Check @types/nodemailer compatibility
- Validate EmailParams interface
- Check for TypeScript errors với `bun check-types`
- Verify 'use node' directive ở đầu file

### 6. **Gmail SMTP Specifics** 📧
- Verify Gmail App Password hoạt động
- Check daily limit (500 emails/day)
- Test với multiple recipients
- Monitor Gmail sent folder
- Check SPF/DKIM records nếu cần

### Potential Issues to Check:
1. **Connection timeout**: Gmail có thể block nếu quá nhiều connections
2. **Rate limiting**: Gmail giới hạn 500 emails/ngày
3. **Spam folder**: Email có thể vào spam nếu không config đúng
4. **TLS/SSL**: Port 587 cần TLS (secure: false là đúng)
5. **App Password**: Phải dùng App Password, không phải password thường

### Testing Commands:
```bash
# Test local development
bun dev

# Test send welcome email
# Register new user qua UI

# Check Convex logs
npx convex logs --follow

# Verify environment variables
npx convex env list
```

### Success Criteria:
✅ Tất cả emails gửi thành công
✅ Emails vào inbox (không phải spam)
✅ Không có TypeScript errors
✅ Logs hiển thị messageId
✅ Không có sensitive data leaks