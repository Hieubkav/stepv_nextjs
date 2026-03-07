## Problem Graph
1. Chủ shop phải bị lock cứng hơn ở user edit và roles <- depends on 1.1, 1.2, 1.3
   1.1 Ở user edit: trạng thái phải luôn “Đang hoạt động” và disable
      1.1.1 ROOT CAUSE: hiện vẫn cho đổi status bằng select
   1.2 Ở roles: vai trò Chủ shop chỉ được xem, không được sửa
      1.2.1 ROOT CAUSE: hiện nút Sửa đang disable theo `isSystem`, không có flow xem riêng cho `shop_owner`
   1.3 Backend cần khóa cứng để chặn API trực tiếp
      1.3.1 ROOT CAUSE: `adminUsers.update` chưa khóa status shop owner; `adminRoles.update` chưa chặn theo key `shop_owner`

## Execution (with reflection)
1. User edit UI: tối giản label vai trò + khóa trạng thái
   - File: `apps/web/src/app/(dashboard)/dashboard/user/[userId]/edit/page.tsx`
   - Đổi label read-only từ `Chủ shop (khóa vai trò)` -> `Chủ shop`.
   - Với `isShopOwner`, phần Trạng thái hiển thị 1 ô read-only hoặc select disabled chỉ còn `Đang hoạt động` (xám).
   - Ẩn/onDisable hoàn toàn khả năng đổi status ở UI cho Chủ shop.
   - Reflection: ✓ đúng yêu cầu “disable trạng thái vì chủ shop luôn hoạt động”.

2. User list UI: chặn toggle trạng thái cho Chủ shop
   - File: `apps/web/src/app/(dashboard)/dashboard/user/page.tsx`
   - Với row `shop_owner`, badge trạng thái hiển thị tĩnh (không click).
   - Guard trong `handleToggleStatus`: nếu `roleKey === "shop_owner"` thì toast và return.
   - Reflection: ✓ không thể đổi trạng thái từ list.

3. Backend users: lock cứng status + role cho Chủ shop
   - File: `packages/backend/convex/adminUsers.ts`
   - Trong `update`, khi target user có role key `shop_owner`:
     - nếu `args.roleId` khác `user.roleId` -> throw (đã có).
     - nếu `args.status` khác `"Active"` -> throw `Không thể thay đổi trạng thái tài khoản Chủ shop`.
   - Reflection: ✓ gọi API trực tiếp cũng không đổi được role/status của Chủ shop.

4. Roles page UI: Chủ shop chỉ xem, ẩn xóa
   - File: `apps/web/src/app/(dashboard)/dashboard/user/roles/page.tsx`
   - List actions:
     - role key `shop_owner`: ẩn nút Xóa.
     - nút Sửa vẫn click được.
   - Khi `startEdit` với `shop_owner`, set cờ `isReadonlyShopOwnerRole=true`.
   - Form khi cờ này bật:
     - disable input Tên/Mô tả + toàn bộ checkbox permissions.
     - ẩn nút `Lưu thay đổi`, chỉ còn nút `Đóng/Hủy xem`.
   - Với role khác: giữ nguyên behavior hiện tại.
   - Reflection: ✓ đúng yêu cầu “vẫn click edit để xem thôi, không sửa”.

5. Backend roles: chặn cập nhật/xóa cho `shop_owner`
   - File: `packages/backend/convex/adminRoles.ts`
   - `update`: nếu `role.key === "shop_owner"` -> throw `Không thể chỉnh sửa vai trò Chủ shop`.
   - `remove`: nếu `role.key === "shop_owner"` -> throw `Không thể xóa vai trò Chủ shop`.
   - Reflection: ✓ lock cứng phía server, đồng bộ với UI.

6. Verify + commit
   - Run: `bunx tsc --project apps/web/tsconfig.json --noEmit`.
   - Commit local, include `.factory/docs` nếu có, không push.

## Checklist
- [ ] Edit user: label vai trò chỉ còn `Chủ shop`
- [ ] Edit user: trạng thái Chủ shop luôn Active và bị disable
- [ ] List user: không toggle trạng thái Chủ shop
- [ ] Backend users: không đổi được role/status Chủ shop qua API
- [ ] Roles list: role `shop_owner` ẩn nút Xóa
- [ ] Roles edit: `shop_owner` mở được chế độ xem, không thể sửa/lưu
- [ ] Backend roles: chặn update/remove cho `shop_owner`
- [ ] Typecheck pass
- [ ] Đã commit, chưa push