## Problem Graph
1. [Main] Đơn giản hóa auth admin về đúng 2 biến env `ADMIN_USERNAME` + `ADMIN_PASSWORD`, vẫn giữ `/dashboard/user` <- depends on 1.1, 1.2
   1.1 [ROOT CAUSE] Flow hiện tại dùng nhiều biến env (super/owner + email), không đúng yêu cầu đơn giản của anh.
   1.2 [Sub] UI login đang theo email, chưa khớp username.

## Execution (with reflection)
1. Backend auth rút gọn về 1 account env
   - Thought: giữ session token DB + RBAC đã làm (để `/dashboard/user` vẫn dùng được), chỉ thay bootstrap account mặc định bằng đúng 2 biến env.
   - Action:
     - Sửa `packages/backend/convex/adminAuth.ts`:
       - `ensureBootstrapAdminsFromEnv` chỉ đọc:
         - `ADMIN_USERNAME`
         - `ADMIN_PASSWORD`
       - Tạo/đồng bộ 1 user duy nhất có role system key `shop_owner` (full permissions).
       - Nếu thiếu 1 trong 2 biến => trả lỗi cấu hình.
       - Login mutation đổi arg từ `email` sang `username` (map vào field `email` nội bộ để không phải refactor schema lớn), so sánh theo `username.trim().toLowerCase()`.
     - Không đụng schema để tránh thay đổi dữ liệu lớn không cần thiết.
   - Reflection: ✓ Đúng yêu cầu “chỉ 2 biến”, nhưng vẫn giữ kiến trúc session/token an toàn.

2. API + UI đổi về username
   - Thought: tối thiểu điểm chạm để không phá các phần khác.
   - Action:
     - `apps/web/src/app/api/admin/login/route.ts`:
       - nhận `{ username, password }`.
       - gọi mutation login mới theo username.
     - `apps/web/src/components/admin/admin-login-form.tsx`:
       - đổi state/input từ email -> username.
       - label về “Tài khoản”.
       - placeholder `admin`.
     - `apps/web/src/app/admin-login/page.tsx` giữ nguyên logic redirect/session check.
     - `apps/web/.env.example` rút về:
       - `ADMIN_USERNAME=admin`
       - `ADMIN_PASSWORD=your_admin_password_here`
       - giữ `ADMIN_SESSION_TTL_HOURS`.
   - Reflection: ✓ UX đúng yêu cầu, code gọn.

3. Giữ nguyên `/dashboard/user`
   - Thought: theo quyết định của anh, không xóa route quản lý user/role.
   - Action:
     - Không thay đổi các route:
       - `/dashboard/user`
       - `/dashboard/user/new`
       - `/dashboard/user/[userId]/edit`
       - `/dashboard/user/roles`
   - Reflection: ✓ Đơn giản auth mặc định nhưng vẫn có phân quyền động cho user phụ.

## File sẽ sửa
- `packages/backend/convex/adminAuth.ts`
- `apps/web/src/app/api/admin/login/route.ts`
- `apps/web/src/components/admin/admin-login-form.tsx`
- `apps/web/.env.example`

## Validation
1. `bunx tsc --noEmit --project apps/web/tsconfig.json`
2. Test manual:
   - login bằng `ADMIN_USERNAME/ADMIN_PASSWORD` thành công
   - thiếu env thì báo lỗi đúng
   - `/dashboard/user` vẫn hoạt động

## Checklist chốt
- [x] Chỉ dùng 2 biến env: `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- [x] UI login quay về “Tài khoản”
- [x] Giữ nguyên `/dashboard/user` và role động