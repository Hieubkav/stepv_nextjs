## Problem Graph
1. Thêm chọn nhanh quyền theo từng resource tại `/dashboard/user/roles` <- depends on 1.1, 1.2
   1.1 Hiện mỗi resource chỉ có các ô `Xem/Tạo/Sửa/Xóa`, chưa có ô tổng
      1.1.1 ROOT CAUSE: UI chưa có control “select all per module”
   1.2 Cần toggle nhanh trong cùng hàng resource
      1.2.1 Ô “Toàn bộ” phải chọn/bỏ toàn bộ action của chính resource đó

## Execution (with reflection)
1. Bổ sung helper xác định trạng thái “đã chọn hết” theo module
   - File: `apps/web/src/app/(dashboard)/dashboard/user/roles/page.tsx`
   - Thêm hàm `isAllModuleActionsSelected(moduleKey)` kiểm tra `actions.every(...)`.
   - Reflection: ✓ Dùng lại được cho `checked` của ô “Toàn bộ”.

2. Bổ sung logic toggle “Toàn bộ” theo module
   - Cùng file trên, thêm hàm `toggleAllPermissions(moduleKey)`:
     - Nếu module đã có đủ 4 quyền -> set `[]`.
     - Nếu chưa đủ -> set toàn bộ keys từ `actions`.
   - Reflection: ✓ Đảm bảo bấm 1 lần chọn hết, bấm lại bỏ hết đúng yêu cầu.

3. Cập nhật UI trong từng dòng resource
   - Tại khối render `modules.map(...)`, chèn 1 checkbox + label `Toàn bộ` nằm trước cụm `Xem/Tạo/Sửa/Xóa`.
   - `checked` dùng `isAllModuleActionsSelected(module.key)`.
   - `onChange` gọi `toggleAllPermissions(module.key)`.
   - Giữ nguyên các checkbox action hiện tại.
   - Reflection: ✓ Không đổi API payload, chỉ tăng UX thao tác.

4. Verify + commit theo rule repo
   - Chạy: `bunx tsc --project apps/web/tsconfig.json --noEmit`.
   - Commit local, kèm `.factory/docs` nếu có, không push.

## Checklist
- [ ] Mỗi resource có thêm ô `Toàn bộ` đứng trước `Xem/Tạo/Sửa/Xóa`
- [ ] Bấm `Toàn bộ` lần 1: chọn hết quyền resource đó
- [ ] Bấm lại: bỏ hết quyền resource đó
- [ ] Checkbox con vẫn hoạt động bình thường
- [ ] Typecheck pass
- [ ] Đã commit, chưa push