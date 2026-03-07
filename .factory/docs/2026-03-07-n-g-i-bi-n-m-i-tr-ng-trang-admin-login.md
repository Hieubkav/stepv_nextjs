Mình sẽ sửa đúng 1 chỗ để không lộ thông tin nhạy cảm trên UI:

1. Mở file `apps/web/src/components/admin/admin-login-form.tsx`.
2. Xóa dòng mô tả cuối card login:
   - `Tài khoản & mật khẩu lấy từ biến môi trường Convex (ADMIN_USERNAME / ADMIN_PASSWORD).`
3. Giữ nguyên toàn bộ logic đăng nhập, validation, API call; chỉ đổi phần hiển thị text.
4. Chạy kiểm tra TypeScript theo rule repo:
   - `bunx tsc --project apps/web/tsconfig.json --noEmit`
5. Commit local (không push), và có kèm `.factory/docs` nếu đang có file docs phát sinh.

Kết quả: tại `http://localhost:3000/admin-login` sẽ không còn hiện hint về `ADMIN_USERNAME / ADMIN_PASSWORD`, giảm lộ thông tin cho người dùng ngoài.