## Problem Graph
1. Đổi từ “disable” sang “ẩn hẳn UI” cho tài khoản `shop_owner` <- depends on 1.1, 1.2
   1.1 Danh sách user đang disable nút Xóa
      1.1.1 ROOT CAUSE: vẫn render nút Xóa với `disabled`
   1.2 Trang edit vẫn render card Đổi mật khẩu
      1.2.1 ROOT CAUSE: card luôn hiển thị, chỉ disable button

## Execution (with reflection)
1. Ẩn nút Xóa ở list user khi là Chủ shop
   - File: `apps/web/src/app/(dashboard)/dashboard/user/page.tsx`
   - Thay phần render nút Xóa sang conditional:
     - `!isShopOwner && <Button ...>Xóa</Button>`
   - Giữ guard trong `handleDelete` để an toàn logic khi gọi trực tiếp từ code path khác.
   - Reflection: ✓ UI không còn thấy nút Xóa cho Chủ shop.

2. Ẩn toàn bộ card Đổi mật khẩu ở trang edit khi là Chủ shop
   - File: `apps/web/src/app/(dashboard)/dashboard/user/[userId]/edit/page.tsx`
   - Bọc card “Đổi mật khẩu” bằng điều kiện `!isShopOwner`.
   - Xóa đoạn text cảnh báo và disable/title trong button vì card đã không hiển thị.
   - Giữ guard trong `handleChangePassword` để phòng trường hợp trigger hàm ngoài UI.
   - Reflection: ✓ Với Chủ shop sẽ không thấy khu vực đổi mật khẩu.

3. Verify + commit theo rule repo
   - Run: `bunx tsc --project apps/web/tsconfig.json --noEmit`.
   - Commit local, include `.factory/docs` nếu có, không push.

## Checklist
- [ ] `/dashboard/user`: tài khoản `shop_owner` không còn nút Xóa
- [ ] `/dashboard/user/[userId]/edit`: tài khoản `shop_owner` không còn card Đổi mật khẩu
- [ ] Guard logic backend/UI vẫn an toàn
- [ ] Typecheck pass
- [ ] Đã commit, chưa push