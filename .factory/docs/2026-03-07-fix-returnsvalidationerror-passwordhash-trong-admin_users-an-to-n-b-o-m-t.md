## Problem Graph
1. [Main] Lỗi `ReturnsValidationError` khi trả dữ liệu `admin_users` <- depends on 1.1, 1.2
   1.1 [Sub] Query trả raw document chứa `passwordHash` nhưng `returns` validator không khai báo field này
      1.1.1 [ROOT CAUSE] `adminUsers.list` và `adminUsers.getById` đang trả object có `passwordHash` (trực tiếp/gián tiếp)
   1.2 [Sub] Rủi ro bảo mật: có thể lộ `passwordHash` ra response nội bộ/frontend

## Execution (with reflection)
1. Solving 1.1.1 ở `packages/backend/convex/adminUsers.ts`
   - Thought: Không thêm `passwordHash` vào validator (vì sai hướng bảo mật), mà sanitize output.
   - Action:
     - Tạo validator output dùng chung cho "safe admin user" (không có `passwordHash`), ví dụ `adminUserSafeDoc`.
     - `getById`: thay `return await ctx.db.get(args.id)` bằng map/sanitize explicit fields (`_id,_creationTime,email,lastLogin,name,roleId,status,createdAt,updatedAt`).
     - `list`: giữ logic hiện tại nhưng đảm bảo object trả về được build từ safe fields + `roleName`,`isSuperAdmin`.
   - Reflection: ✓ Khớp validator, chặn lộ hash, không đổi behavior nghiệp vụ.

2. Rà soát toàn bộ backend theo scope bạn chọn
   - Thought: Chỉ nơi "trả dữ liệu ra ngoài" mới cần sanitize; nơi auth nội bộ vẫn cần `passwordHash` để verify.
   - Action:
     - Rà `packages/backend/convex/**` các chỗ query/get `admin_users`.
     - Xác nhận các endpoint auth (`adminAuth.loginWithPassword`, `verifySession`) không trả `passwordHash`.
     - Nếu phát hiện endpoint nào trả raw `admin_users`, áp dụng cùng helper sanitize để DRY.
   - Reflection: ✓ Giảm nguy cơ tái phát và rò rỉ dữ liệu nhạy cảm.

3. Verification
   - Action:
     - Chạy `bunx tsc --noEmit` (theo rule repo).
     - Kiểm tra type của `returns` và object trả về khớp hoàn toàn.
   - Reflection: ✓ Đảm bảo pass compile và hết `ReturnsValidationError`.

4. Commit (sau khi bạn approve và mình implement)
   - Action:
     - `git status` + `git diff --cached` kiểm tra không có secret.
     - Commit với message dạng: `fix(admin): sanitize admin_users responses to exclude passwordHash`
     - Nếu có `.factory/docs` thì add kèm đúng rule repo.
   - Reflection: ✓ Tuân thủ quy tắc dự án, không push.

## Checklist triển khai
- [ ] Thêm/chuẩn hóa "safe output" validator cho admin user
- [ ] Sửa `adminUsers.getById` trả sanitized object
- [ ] Chuẩn hóa `adminUsers.list` chỉ trả safe fields
- [ ] Rà các endpoint backend khác liên quan `admin_users` để tránh trả raw doc
- [ ] Chạy `bunx tsc --noEmit`
- [ ] Commit (không push), kèm `.factory/docs` nếu có

## Best practice áp dụng
- Security by default: tuyệt đối không expose `passwordHash` ra API response.
- Explicit projection: luôn map field khi trả user object thay vì return raw document.
- DRY + consistency: dùng chung validator/helper sanitize để tránh lỗi lặp lại ở endpoint mới.