## Problem Graph
1. [Main] Thêm breadcrumb để từ `/dashboard/user/roles` quay lại nhanh `/dashboard/user`
   1.1 [Sub] Xác định đúng file route cần sửa <- đã xác định `apps/web/src/app/(dashboard)/dashboard/user/roles/page.tsx`
   1.2 [ROOT CAUSE] Trang roles chưa có điều hướng ngữ cảnh về trang user list
   1.3 [Sub] Đảm bảo UI theo KISS/YAGNI và đồng bộ style hiện có

## Execution (with reflection)
1. Solving 1.2 (ROOT CAUSE)
   - Thought: Chèn breadcrumb text đơn giản ngay đầu trang, dùng `next/link`, không thêm component/dependency mới.
   - Action (planned):
     - Mở `apps/web/src/app/(dashboard)/dashboard/user/roles/page.tsx`.
     - Thêm `import Link from "next/link";`.
     - Trong JSX root (`<div className="space-y-4 p-4">`), thêm block breadcrumb trước card đầu tiên:
       - `Người dùng` là link tới `/dashboard/user`
       - dấu phân tách `/`
       - `Vai trò` là text thường, không clickable.
     - Ví dụ cấu trúc:
       - container nhỏ: `text-sm text-muted-foreground`
       - link có hover nhẹ để đúng pattern dashboard.
   - Reflection: ✓ Đáp ứng đúng yêu cầu truy cập nhanh, ít thay đổi, không ảnh hưởng logic CRUD hiện tại.

2. Solving 1.3 (UI consistency)
   - Thought: Giữ phong cách tương tự trang dashboard hiện tại (utility class + shadcn tokens), tránh over-engineering.
   - Action (planned):
     - Chỉ thêm markup tối thiểu cho breadcrumb, không tạo component dùng chung vì scope hiện tại là 1 trang.
     - Không đổi API call/state/form/table đang hoạt động.
   - Reflection: ✓ KISS/DRY/YAGNI phù hợp scope.

3. Verification plan
   - Thought: Theo rule repo, chỉ cần typecheck TS khi có đổi code TS/TSX.
   - Action (planned): chạy `bunx tsc --project apps/web/tsconfig.json --noEmit`.
   - Reflection: ✓ Đủ để xác nhận thay đổi không gây lỗi kiểu.

4. Commit plan (sau khi bạn approve và mình implement)
   - Commit 1 lần với message ngắn gọn kiểu: `feat(admin): add breadcrumb on roles page`
   - Include `.factory/docs` nếu có thay đổi trong thư mục đó theo rule dự án.

## Checklist triển khai
- [ ] Sửa đúng file `.../dashboard/user/roles/page.tsx`
- [ ] Breadcrumb hiển thị: `Người dùng / Vai trò`
- [ ] `Người dùng` clickable về `/dashboard/user`
- [ ] `Vai trò` không clickable
- [ ] Typecheck pass với `bunx tsc --project apps/web/tsconfig.json --noEmit`
- [ ] Commit local (không push)

## Best practices áp dụng
- KISS: dùng link text + `/`, không thêm abstraction mới.
- YAGNI: chưa tạo breadcrumb component dùng chung khi chưa có nhu cầu nhiều nơi.
- DRY hợp lý: chỉ tái sử dụng class utility sẵn có, không nhân bản logic.
- Safety: thay đổi thuần UI điều hướng, không động vào quyền/API/database.