## Problem Graph
1. Chủ shop không được đổi vai trò tại `/dashboard/user/[userId]/edit` <- depends on 1.1, 1.2
   1.1 UI hiện vẫn có dropdown vai trò
      1.1.1 ROOT CAUSE: form render `<select roleId>` cho mọi user
   1.2 API update vẫn nhận `roleId` cho chủ shop
      1.2.1 ROOT CAUSE: backend chưa chặn đổi role theo `shop_owner`

## Execution (with reflection)
1. Khóa cứng ở backend (bắt buộc)
   - File: `packages/backend/convex/adminUsers.ts`
   - Trong `update`, sau khi lấy `user`, thêm check role hiện tại:
     - nếu user hiện tại có role key `shop_owner` và `args.roleId` khác `user.roleId` => throw lỗi `Không thể thay đổi vai trò tài khoản Chủ shop`.
   - Mục tiêu: chặn cả trường hợp gọi API trực tiếp, không phụ thuộc UI.
   - Reflection: ✓ đảm bảo an toàn dữ liệu.

2. Ẩn UI đổi vai trò cho Chủ shop
   - File: `apps/web/src/app/(dashboard)/dashboard/user/[userId]/edit/page.tsx`
   - Với `isShopOwner`:
     - không render `<select>` vai trò.
     - render text read-only (ví dụ: `Chủ shop (khóa vai trò)`).
   - Với user khác: giữ nguyên dropdown như hiện tại.
   - Reflection: ✓ đúng yêu cầu “chỉ show thôi, không được đổi”.

3. UX thông báo nhẹ khi lưu
   - Nếu là `isShopOwner`, submit vẫn cho sửa các field khác (email, tên, trạng thái) nhưng role luôn giữ nguyên.
   - Không cần thêm tính năng mới ngoài scope.

4. Verify + commit theo rule repo
   - Chạy: `bunx tsc --project apps/web/tsconfig.json --noEmit`.
   - Commit local, include `.factory/docs` nếu có, không push.

## Checklist
- [ ] Chủ shop không thấy dropdown đổi vai trò
- [ ] Chủ shop chỉ thấy vai trò ở dạng read-only
- [ ] Backend chặn đổi role Chủ shop kể cả gọi API trực tiếp
- [ ] Các chỉnh sửa khác của user vẫn hoạt động bình thường
- [ ] Typecheck pass
- [ ] Đã commit, chưa push