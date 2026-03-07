## Problem Graph
1. Không cho thao tác xóa/đổi mật khẩu với Chủ shop tại `/dashboard/user` <- depends on 1.1, 1.2
   1.1 UI hiện tại chưa biết account nào là `shop_owner`
      1.1.1 ROOT CAUSE: dữ liệu list/getById chưa trả `roleKey`
   1.2 API hiện tại chưa chặn theo `shop_owner`
      1.2.1 ROOT CAUSE: backend chỉ chặn theo `isSuperAdmin`

## Execution (with reflection)
1. Mở rộng payload user để nhận diện Chủ shop
   - File: `packages/backend/convex/adminUsers.ts`
   - `list`: thêm `roleKey` vào object trả về (map từ `admin_roles.key`).
   - `getById`: thêm `roleKey` vào object trả về (query role theo `user.roleId`).
   - Reflection: ✓ UI có dữ liệu chuẩn để disable đúng tài khoản `shop_owner`.

2. Chặn cứng ở backend cho đổi mật khẩu/xóa
   - File: `packages/backend/convex/adminUsers.ts`
   - Thêm helper `assertNotShopOwner(ctx, targetRoleId)`:
     - lấy role theo `targetRoleId`
     - nếu `role?.key === "shop_owner"` -> throw `"Không thể xóa hoặc đổi mật khẩu tài khoản Chủ shop"`.
   - Gọi helper này trong `changePassword` và `remove` trước khi patch/delete.
   - Reflection: ✓ Dù gọi API trực tiếp vẫn bị chặn đúng rule.

3. Disable thao tác trên UI danh sách user
   - File: `apps/web/src/app/(dashboard)/dashboard/user/page.tsx`
   - Mở rộng type `AdminUser` thêm `roleKey?: string`.
   - Tạo biến `isShopOwner = user.roleKey === "shop_owner"` khi render row.
   - Nút Xóa: thêm `disabled={isShopOwner}`, `title`/`aria-label` mô tả lý do.
   - Trong `handleDelete`, guard đầu hàm: nếu `roleKey === "shop_owner"` thì `toast.error(...)` và return.
   - Reflection: ✓ UX rõ ràng, đúng yêu cầu “disable + thông báo”.

4. Disable đổi mật khẩu ở trang edit user
   - File: `apps/web/src/app/(dashboard)/dashboard/user/[userId]/edit/page.tsx`
   - Mở rộng type `AdminUser` thêm `roleKey?: string`.
   - Tính `isShopOwner = user.roleKey === "shop_owner"`.
   - Button “Cập nhật mật khẩu”: `disabled={isShopOwner}` + `title` lý do.
   - Thêm text nhỏ dưới input (hoặc toast khi bấm) thông báo tài khoản Chủ shop không được đổi mật khẩu.
   - Trong `handleChangePassword`, guard `isShopOwner` để chặn sớm + toast.
   - Reflection: ✓ Hành vi đồng nhất với danh sách.

5. Verify + commit
   - Run: `bunx tsc --project apps/web/tsconfig.json --noEmit`.
   - Commit local, include `.factory/docs` nếu có, không push.

## Checklist
- [ ] Tài khoản `shop_owner` bị disable nút Xóa ở list user
- [ ] Tài khoản `shop_owner` bị disable nút cập nhật mật khẩu ở trang edit
- [ ] UI có thông báo lý do (title/toast)
- [ ] API `remove` và `changePassword` chặn cứng cho `shop_owner`
- [ ] Typecheck pass
- [ ] Đã commit, chưa push