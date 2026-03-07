Chuẩn luôn, mình đã thêm 2 yêu cầu mới của bạn vào plan (cấm role rỗng quyền và policy no-read). Dưới đây là spec final để bạn duyệt:

## Problem Graph
1. [Main] User bị giới hạn quyền vẫn thấy/lọt vào trang không đúng quyền trong dashboard  
   1.1 [ROOT CAUSE] Sidebar đang cho `canAccess=true` lúc `isLoading`, gây FOUC lộ menu.  
   1.2 [ROOT CAUSE] Chưa có route guard tập trung cho `/dashboard/**`, nên gõ URL trực tiếp vẫn vào được.  
   1.3 [ROOT CAUSE] Sau login mặc định rơi `/dashboard` dù role không có `dashboard.read`.
2. [Main] Có thể tạo/cập nhật role không có quyền đọc nào (role “mù”)  
   2.1 [ROOT CAUSE] Form create/edit chưa validate “ít nhất 1 read”.  
   2.2 [ROOT CAUSE] Backend `adminRoles.create/update` chưa chặn nên có thể bypass frontend qua API.

## Execution (with reflection)
1. Tạo utility quyền/route dùng chung (single source of truth).  
   - **File mới**: `apps/web/src/lib/admin-route-access.ts`  
   - Chứa:
     - `resolveModuleKeyFromPath(pathname)`
     - `hasPermission(user, moduleKey, action)`
     - `hasAnyReadPermission(user)`
     - `getFirstAccessibleDashboardPath(user)` (fallback theo thứ tự menu, ví dụ post trước dashboard nếu dashboard không có read)
   - Reflection: tránh lệch logic giữa login, sidebar, route guard.

2. Mở rộng `AdminAuthContext` để expose access theo path + landing hợp lệ.  
   - **File**: `apps/web/src/features/admin/auth/admin-auth-context.tsx`  
   - Thêm:
     - `canAccessPath(pathname: string)`
     - `firstAccessiblePath: string | null`
     - `hasAnyReadAccess: boolean`
   - Reflection: mọi nơi chỉ đọc từ context, giảm duplicate.

3. Chặn FOUC bằng skeleton toàn dashboard layout khi auth/permission chưa sẵn sàng.  
   - **File**: `apps/web/src/components/layout/authenticated-layout.tsx`  
   - **File mới**: `apps/web/src/components/layout/dashboard-layout-skeleton.tsx`  
   - Rule:
     - `isLoading` => chỉ render skeleton (không mount sidebar thật)
     - loaded => render layout thật
   - Reflection: đúng yêu cầu đổi FOUC thành skeleton.

4. Sửa sidebar filtering để không permissive khi loading/user null.  
   - **File**: `apps/web/src/components/layout/app-sidebar.tsx`  
   - Bỏ logic `isLoading || !user => true`; thay bằng data đã ổn định từ context.
   - Reflection: không còn ló item trái quyền.

5. Thêm route guard client cho toàn bộ `/dashboard/**`.  
   - **File mới**: `apps/web/src/components/layout/dashboard-route-guard.tsx`  
   - **File**: `apps/web/src/components/layout/authenticated-layout.tsx` (wrap children)
   - Hành vi theo lựa chọn của bạn:
     - Nếu URL hiện tại không có quyền read => redirect về `firstAccessiblePath`
     - Nếu không có bất kỳ read nào => không cho vào dashboard, chuyển `admin-login?reason=no-access` (an toàn + rõ ràng)
   - Reflection: chặn cứng truy cập trực tiếp URL ngoài quyền.

6. Sửa redirect sau login để vào đúng trang đầu tiên có quyền read.  
   - **File**: `apps/web/src/components/admin/admin-login-form.tsx`  
   - **File**: `apps/web/src/app/admin-login/page.tsx`  
   - Nếu `nextPath` không hợp quyền thì override sang `firstAccessiblePath`.
   - Nếu không có read nào thì giữ ở login và báo lỗi rõ ràng.

7. Thêm best-practice validation: role bắt buộc có ít nhất 1 quyền `read` (frontend + backend).  
   - **Frontend**:
     - `apps/web/src/app/(dashboard)/dashboard/roles/create/page.tsx`
     - `apps/web/src/app/(dashboard)/dashboard/roles/[id]/edit/page.tsx`
     - Trước submit: nếu không có bất kỳ `*.read` => toast lỗi, không gửi request.
   - **Backend (nguồn chặn chính, chống bypass API)**:
     - `packages/backend/convex/adminRoles.ts`
     - Tạo helper validate permissions:
       - reject nếu tổng permissions rỗng
       - reject nếu không có ít nhất một action `read` ở bất kỳ module nào
     - Áp dụng cho `create` và `update` (khi có `args.permissions`).
   - Reflection: đúng yêu cầu “không thể tạo role rỗng quyền” + policy no-read.

8. (Tùy chọn nhẹ, nhưng nên có) thông báo rõ lý do khi không có quyền đọc.  
   - Reuse login page hiện tại bằng query `?reason=no-access` và hiển thị alert ngắn “Tài khoản chưa được cấp quyền truy cập dashboard, vui lòng liên hệ quản trị”.
   - Không cần tạo thêm page mới để giữ KISS.

9. Verify + commit theo rule repo.  
   - Chạy duy nhất: `bunx tsc --project apps/web/tsconfig.json --noEmit`  
   - Commit local (không push), kèm `.factory/docs` nếu có.

## Best Practice cho case “không có quyền read nào” (đã chọn)
- **Không cho lưu role** ngay từ create/update nếu thiếu read.  
- **Defense in depth**: chặn cả frontend lẫn backend.  
- **Fail-safe default**: user không có read thì không vào dashboard; hiển thị thông điệp rõ ràng để admin xử lý phân quyền.

## Checklist
- [ ] Utility access dùng chung (`admin-route-access.ts`)
- [ ] Skeleton toàn layout khi loading auth
- [ ] Sidebar không lộ item trái quyền
- [ ] Route guard chặn URL trái quyền và redirect về trang có quyền
- [ ] Login redirect theo quyền thực tế
- [ ] Validate role phải có >=1 quyền read ở FE + BE
- [ ] `bunx tsc --project apps/web/tsconfig.json --noEmit` pass
- [ ] Commit local (không push)

Nếu bạn duyệt spec này, mình sẽ implement đúng y chang, không mở rộng thêm scope.