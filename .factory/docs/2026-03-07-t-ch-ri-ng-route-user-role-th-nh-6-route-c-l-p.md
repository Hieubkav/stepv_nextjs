## Problem Graph
1. [Main] Chuẩn hoá route quản trị user/role thành 6 route độc lập theo REST số nhiều
   1.1 [Sub] Tách page vai trò đang nằm lồng trong `/dashboard/user/roles`
      1.1.1 [ROOT CAUSE] Cấu trúc route hiện tại gom role dưới user nên URL không nhất quán
   1.2 [Sub] Đồng bộ toàn bộ link nội bộ + sidebar + phân quyền theo URL mới
   1.3 [Sub] Bổ sung route create/edit cho role riêng như user

## Execution (with reflection)
1. Solving 1.1.1 (tách route gốc)
   - Action: Di chuyển/tạo lại page theo 6 URL mới:
     - `/dashboard/users` (list user)
     - `/dashboard/users/create` (create user)
     - `/dashboard/users/[id]/edit` (edit user)
     - `/dashboard/roles` (list role)
     - `/dashboard/roles/create` (create role)
     - `/dashboard/roles/[id]/edit` (edit role)
   - Reflection: ✓ Đúng yêu cầu “chia 6 route, riêng hết”

2. Tách UI role hiện tại (đang vừa form vừa list trong 1 trang)
   - Action:
     - `apps/web/src/app/(dashboard)/dashboard/roles/page.tsx`: giữ phần danh sách vai trò + nút “Tạo vai trò” + nút “Sửa” điều hướng
     - `apps/web/src/app/(dashboard)/dashboard/roles/create/page.tsx`: tách form tạo vai trò
     - `apps/web/src/app/(dashboard)/dashboard/roles/[id]/edit/page.tsx`: tách form sửa vai trò (giữ logic shop_owner/system như hiện tại)
   - Reflection: ✓ Tách rõ list/create/edit cho role, không nhồi chung 1 page

3. Tổ chức lại route user theo URL mới
   - Action:
     - Tạo route mới từ code hiện có:
       - `.../dashboard/users/page.tsx` (từ `/dashboard/user/page.tsx`)
       - `.../dashboard/users/create/page.tsx` (từ `/dashboard/user/new/page.tsx`)
       - `.../dashboard/users/[id]/edit/page.tsx` (từ `/dashboard/user/[userId]/edit/page.tsx`, đổi param từ `userId` -> `id`)
     - Cập nhật toàn bộ `Link/router.push` trong 3 page này sang `/dashboard/users...`
   - Reflection: ✓ URL user đồng nhất số nhiều, đúng option bạn chọn

4. Đồng bộ navigation + permission mapping
   - Action:
     - `apps/web/src/components/layout/data/sidebar-data.ts`
       - đổi menu: `/dashboard/user` -> `/dashboard/users`
       - đổi menu role: `/dashboard/user/roles` -> `/dashboard/roles`
     - `apps/web/src/components/layout/app-sidebar.tsx`
       - đổi `resolveModuleKey`:
         - `/dashboard/roles...` => `roles`
         - `/dashboard/users...` => `users`
   - Reflection: ✓ Sidebar/permission không bị lệch sau đổi URL

5. Dọn route cũ theo yêu cầu “không redirect”
   - Action: xóa route cũ:
     - `.../dashboard/user/page.tsx`
     - `.../dashboard/user/new/page.tsx`
     - `.../dashboard/user/[userId]/edit/page.tsx`
     - `.../dashboard/user/roles/page.tsx`
   - Reflection: ✓ Không giữ URL cũ, chỉ dùng URL mới

6. Rà soát tham chiếu toàn codebase
   - Action: grep toàn bộ `"/dashboard/user"`, `"/dashboard/user/roles"`, `"/dashboard/user/new"`, `"[userId]"` để thay hết sang URL mới
   - Reflection: ✓ Tránh sót link chết

7. Verify theo rule repo
   - Action: chạy đúng lệnh yêu cầu trước commit:
     - `bunx tsc --project apps/web/tsconfig.json --noEmit`
   - Reflection: ✓ Đúng AGENTS.md (không chạy lint/test khác)

8. Commit (không push)
   - Action:
     - `git status` + `git diff --cached` kiểm tra thay đổi/sensitive data
     - `git add` toàn bộ file đổi + thêm `.factory/docs` nếu thư mục tồn tại thay đổi
     - commit message đề xuất: `refactor(admin): split users and roles into dedicated routes`
   - Reflection: ✓ Tuân thủ rule “xong phải commit, không push”

## File dự kiến thay đổi
- Cập nhật:
  - `apps/web/src/components/layout/data/sidebar-data.ts`
  - `apps/web/src/components/layout/app-sidebar.tsx`
- Tạo mới:
  - `apps/web/src/app/(dashboard)/dashboard/users/page.tsx`
  - `apps/web/src/app/(dashboard)/dashboard/users/create/page.tsx`
  - `apps/web/src/app/(dashboard)/dashboard/users/[id]/edit/page.tsx`
  - `apps/web/src/app/(dashboard)/dashboard/roles/page.tsx`
  - `apps/web/src/app/(dashboard)/dashboard/roles/create/page.tsx`
  - `apps/web/src/app/(dashboard)/dashboard/roles/[id]/edit/page.tsx`
- Xoá cũ:
  - `apps/web/src/app/(dashboard)/dashboard/user/page.tsx`
  - `apps/web/src/app/(dashboard)/dashboard/user/new/page.tsx`
  - `apps/web/src/app/(dashboard)/dashboard/user/[userId]/edit/page.tsx`
  - `apps/web/src/app/(dashboard)/dashboard/user/roles/page.tsx`

## Checklist xác nhận
- [x] 6 route tách riêng hoàn toàn (2 list, 2 create, 2 edit)
- [x] Dùng chuẩn URL REST số nhiều bạn đã chọn
- [x] Không redirect URL cũ
- [x] Cập nhật toàn bộ link nội bộ + sidebar + permission mapping
- [x] Verify bằng `bunx tsc --project apps/web/tsconfig.json --noEmit`
- [x] Commit local, không push