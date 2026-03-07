## Problem Graph
1. [Main] Không cho chọn role Chủ shop ở `/dashboard/users/create`
   1.1 [ROOT CAUSE] Form create đang lấy toàn bộ roles từ API và render trực tiếp vào `<select>`
   1.2 [Sub] Cần xử lý edge-case khi chỉ còn mỗi role Chủ shop

## Execution (with reflection)
1. Cập nhật type role để nhận diện shop owner ổn định
   - File: `apps/web/src/app/(dashboard)/dashboard/users/create/page.tsx`
   - Đổi `type Role` thêm field `key: string`
   - Reflection: ✓ Có căn cứ lọc chính xác theo `role.key === "shop_owner"`

2. Lọc role hợp lệ cho màn tạo user
   - Tạo biến `assignableRoles = roles.filter((role) => role.key !== "shop_owner")`
   - Khi load roles, set default `roleId` theo `assignableRoles[0]?._id` thay vì `roles[0]`
   - Reflection: ✓ Chủ shop biến mất khỏi dropdown, đúng yêu cầu

3. Chặn submit nếu không còn role hợp lệ
   - Tạo `const hasAssignableRole = assignableRoles.length > 0`
   - Trong `handleSubmit`, thêm guard:
     - nếu `!hasAssignableRole` -> `toast.error("Không có vai trò hợp lệ để gán")` và return
   - Reflection: ✓ Khóa luồng tạo user sai business

4. Disable UI theo phương án bạn chọn
   - Dropdown role:
     - nếu có role hợp lệ: render options từ `assignableRoles`
     - nếu không có: render 1 option disabled: `Không có vai trò hợp lệ để gán`
   - Nút `Tạo người dùng`: disable khi `pending || !hasAssignableRole`
   - Thêm text cảnh báo nhỏ dưới field role khi `!hasAssignableRole`
   - Reflection: ✓ Đúng quyết định: disable nút tạo + báo rõ lý do

5. Verify
   - Chạy: `bunx tsc --project apps/web/tsconfig.json --noEmit`
   - Reflection: ✓ Đảm bảo không vỡ type

6. Commit (không push)
   - `git status` + `git diff --cached` kiểm tra staged changes và secrets
   - `git add` file đã sửa + `.factory/docs` (nếu có)
   - Commit message đề xuất: `fix(admin): prevent assigning shop owner role on user create`

## Checklist
- [x] Không thể chọn role Chủ shop ở `/dashboard/users/create`
- [x] Nếu chỉ còn role Chủ shop: disable nút tạo + hiện "Không có vai trò hợp lệ để gán"
- [x] Type-check pass bằng `bunx tsc --project apps/web/tsconfig.json --noEmit`
- [x] Commit local, không push