## Problem Graph
1. [Main] Nâng auth + phân quyền admin cho `dohy` theo hướng dự án tham chiếu nhưng gọn cho 1 dashboard <- depends on 1.1, 1.2, 1.3, 1.4
   1.1 [ROOT CAUSE] Auth admin hiện tại chỉ là env username/password + cookie `authenticated`, không có session thật và không có role/user động.
   1.2 [Sub] Chưa có schema/users/roles/sessions cho admin trong Convex backend của `dohy`.
   1.3 [Sub] Chưa có route `/dashboard/user` để CRUD user + gán role.
   1.4 [Sub] Sidebar + guard chưa gắn kiểm tra permission theo module.

## Execution (with reflection)
1. Solving 1.1 (Auth architecture chuẩn, minimal cho dự án này)
   - Thought: Migrate từ `ADMIN_USERNAME/ADMIN_PASSWORD` sang login qua bảng admin trong Convex, nhưng vẫn bootstrap bằng env để đúng yêu cầu.
   - Action:
     - Thêm env mới (apps/web/.env.example + backend runtime docs nội bộ code comment ngắn):
       - `ADMIN_SUPER_EMAIL`, `ADMIN_SUPER_PASSWORD`, `ADMIN_SUPER_NAME`
       - `ADMIN_OWNER_EMAIL`, `ADMIN_OWNER_PASSWORD`, `ADMIN_OWNER_NAME`
       - `ADMIN_SESSION_TTL_HOURS` (default 8)
     - Backend thêm mutation `adminAuth.ensureBootstrapAdminsFromEnv`:
       - Tạo/đồng bộ 2 tài khoản gốc: `super_admin`, `shop_owner`.
       - Role `super_admin`: wildcard `*`.
       - Role `shop_owner`: full quyền module nghiệp vụ dashboard (trừ quản trị role/user hệ thống nếu cần).
       - Hash password (không plain text).
     - Login flow mới:
       - `POST /api/admin/login` gọi Convex mutation `adminAuth.loginWithPassword`.
       - Mutation tạo `admin_sessions` token random + expiry.
       - API set cookie HttpOnly `admin_session_token` (secure/lax, maxAge).
     - Middleware + layout:
       - Không check cookie `authenticated` nữa.
       - Check sự tồn tại token cookie; các page/actions nhạy cảm sẽ verify token qua Convex helper.
   - Reflection: ✓ Đúng yêu cầu env Convex + an toàn hơn hẳn mô hình hiện tại.

2. Solving 1.2 (RBAC data model đủ dùng, không over-engineer)
   - Thought: Chỉ cần module-level CRUD là đủ cho dự án này (theo lựa chọn của anh), tránh framework resource động như system.
   - Action (file chính: `packages/backend/convex/schema.ts` + module mới):
     - Thêm table:
       - `admin_roles`: `{ key, name, description?, isSystem, isSuperAdmin, permissions, createdAt, updatedAt }`
       - `admin_users`: `{ email, name, passwordHash, roleId, status, lastLogin?, createdAt, updatedAt }`
       - `admin_sessions`: `{ token, userId, expiresAt, createdAt }`
     - Index:
       - roles: `by_key`, `by_name`
       - users: `by_email`, `by_role_status`
       - sessions: `by_token`, `by_user`
     - Module mới:
       - `adminAuth.ts`: login/logout/verify/ensureBootstrap
       - `adminRoles.ts`: list/create/update/delete (khóa sửa role system)
       - `adminUsers.ts`: list/create/update/changePassword/delete
       - `lib/adminPermissions.ts`: `requireAdminPermission(token, module, action)`
     - Permission map cố định cho dự án này (YAGNI):
       - `dashboard`, `media`, `courses`, `customers`, `orders`, `post`, `project`, `project_category`, `library`, `library_software`, `vfx`, `home_blocks`, `about_blocks`, `settings`, `users`, `roles`.
   - Reflection: ✓ Bám KISS/DRY, đủ mở rộng sau này nhưng không “dynamic resource engine”.

3. Solving 1.3 (/dashboard/user + phân quyền động)
   - Thought: Tái sử dụng pattern page list hiện có (`students`, `customers`) để giữ consistency UI.
   - Action:
     - Tạo route: `apps/web/src/app/(dashboard)/dashboard/user/page.tsx`
       - Bảng user admin: tên, email, role, trạng thái, lastLogin.
       - Search + filter active/inactive.
       - Action: tạo user, sửa user, khóa/mở, reset mật khẩu, xóa.
     - Tạo:
       - `.../dashboard/user/new/page.tsx`
       - `.../dashboard/user/[userId]/edit/page.tsx`
       - (nếu cần nhanh) modal form nội tuyến thay vì nhiều route phụ.
     - Tạo route role quản lý nhẹ:
       - `.../dashboard/user/roles/page.tsx` (optional nhưng nên có để “phân quyền động” đúng nghĩa)
       - CRUD role + checkbox matrix CRUD theo module.
     - Chặn nghiệp vụ:
       - Không cho xóa super admin cuối cùng.
       - Không cho user thường sửa quyền super admin.
   - Reflection: ✓ Đáp ứng đúng “/dashboard/user quản lý user + phân quyền động”.

4. Solving 1.4 (Guard + Sidebar + API hardening)
   - Thought: UI ẩn menu chỉ là UX; bảo mật thực sự phải check ở backend mutation/query.
   - Action:
     - Cập nhật `apps/web/src/components/layout/data/sidebar-data.ts`:
       - Thêm mục `Người dùng` -> `/dashboard/user`.
     - Thêm AdminAuthProvider riêng cho dashboard:
       - Đọc session bằng call `adminAuth.verifySession` (qua API route trung gian hoặc server action).
       - Expose `hasPermission(module, action)` để ẩn/hiện menu.
     - Update middleware `apps/web/middleware.ts`:
       - Redirect `/dashboard/**` nếu không có `admin_session_token`.
     - Update logout route:
       - Xóa session DB + delete cookie token.
     - Mọi mutation admin (`adminUsers/adminRoles`): bắt buộc `requireAdminPermission`.
   - Reflection: ✓ Phòng thủ nhiều lớp: middleware + backend authorization.

## Chi tiết file dự kiến thay đổi
- Backend
  - `packages/backend/convex/schema.ts` (thêm 3 bảng admin)
  - `packages/backend/convex/adminAuth.ts` (mới)
  - `packages/backend/convex/adminUsers.ts` (mới)
  - `packages/backend/convex/adminRoles.ts` (mới)
  - `packages/backend/convex/lib/adminPermissions.ts` (mới)
- Frontend
  - `apps/web/src/app/api/admin/login/route.ts` (đổi qua Convex login)
  - `apps/web/src/app/api/admin/logout/route.ts` (revoke session DB)
  - `apps/web/src/app/admin-login/page.tsx` (đổi copy username->email)
  - `apps/web/src/components/admin/admin-login-form.tsx` (login email/password)
  - `apps/web/middleware.ts` (cookie token check)
  - `apps/web/src/app/(dashboard)/layout.tsx` (verify session logic)
  - `apps/web/src/components/layout/data/sidebar-data.ts` (thêm menu User)
  - `apps/web/src/app/(dashboard)/dashboard/user/page.tsx` (+ new/edit subroutes)
  - (nếu cần) `apps/web/src/features/admin/auth/*` cho context nhỏ gọn
- Env
  - `apps/web/.env.example` (replace old admin env bằng cặp super/owner)

## Security & Best practices áp dụng
- Password hash ở backend Convex, không lưu plain text.
- Session token random + TTL + revoke on logout.
- Cookie HttpOnly/SameSite/Lax + `secure` ở production.
- Authorization kiểm tra ở mutation/query, không chỉ ở UI.
- Giới hạn quyền super admin/owner đúng role.

## Validation plan sau implement
1. `bunx tsc --noEmit` (theo rule dự án).
2. Manual test matrix:
   - Login super admin / owner thành công.
   - User thường không vào `/dashboard/user` nếu không có quyền.
   - Tạo role mới, gán quyền, gán user, login user mới -> quyền phản ánh đúng.
   - Logout revoke session thật (token cũ không dùng lại được).
3. Kiểm thử edge cases: sai password, account inactive, session expired.

## Commit plan
- Commit 1: `feat(admin-auth): migrate dashboard auth to convex env bootstrap with session token`
- Commit 2: `feat(admin-rbac): add admin users/roles management at /dashboard/user`
- Luôn add `.factory/docs` nếu có thay đổi phát sinh trong thư mục đó.

## Checklist chốt cho anh
- [x] Super admin + chủ shop bootstrap từ env Convex (seed & sync).
- [x] Session admin chuẩn HttpOnly cookie + DB token.
- [x] RBAC module CRUD gọn cho đúng scope dự án.
- [x] Route `/dashboard/user` để quản lý user + phân quyền động.
- [x] Không dùng kiểu dynamic resource engine phức tạp như system.