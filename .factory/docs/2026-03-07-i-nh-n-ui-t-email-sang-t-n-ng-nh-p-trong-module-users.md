## Problem Graph
1. [Main] Đồng bộ wording UI trong `/dashboard/users` từ "Email" thành "Tên đăng nhập"
   1.1 [ROOT CAUSE] UI đang hiển thị label/cột/search placeholder theo email dù ngữ nghĩa nghiệp vụ là tài khoản đăng nhập
   1.2 [Sub] Giữ nguyên API/DB field `email`, chỉ đổi text hiển thị

## Execution (with reflection)
1. Cập nhật trang list users
   - File: `apps/web/src/app/(dashboard)/dashboard/users/page.tsx`
   - Đổi các text UI:
     - placeholder tìm kiếm: `Tìm theo tên, email...` -> `Tìm theo tên, tên đăng nhập...`
     - tiêu đề cột: `Email` -> `Tên đăng nhập`
   - Giữ nguyên logic sort/search theo field `email` (không đổi API/DB)
   - Reflection: ✓ Đúng phạm vi "chỉ đổi UI"

2. Cập nhật trang create user
   - File: `apps/web/src/app/(dashboard)/dashboard/users/create/page.tsx`
   - Đổi label field: `Email` -> `Tên đăng nhập`
   - (Tuỳ chọn nhẹ) placeholder từ `admin@dohy.com` -> ví dụ username rõ nghĩa, ví dụ `admin.dohy`
   - Không đổi payload gửi API (`email` vẫn giữ nguyên)
   - Reflection: ✓ Người dùng thấy đúng nghĩa, backend không bị ảnh hưởng

3. Cập nhật trang edit user
   - File: `apps/web/src/app/(dashboard)/dashboard/users/[id]/edit/page.tsx`
   - Đổi label field: `Email` -> `Tên đăng nhập`
   - Không đổi state/field code (`email`)
   - Reflection: ✓ Đồng bộ wording giữa create/edit/list

4. Rà soát toàn bộ module users
   - Tìm lại chuỗi `Email` trong `.../dashboard/users/**` để đảm bảo không sót UI text
   - Reflection: ✓ Tránh lệch wording giữa các màn

5. Verify theo rule repo
   - Chạy: `bunx tsc --project apps/web/tsconfig.json --noEmit`
   - Reflection: ✓ Đảm bảo không phát sinh lỗi type

6. Commit (không push)
   - Kiểm tra `git status` + `git diff --cached` (soát secrets)
   - `git add` các file đổi + `.factory/docs` nếu có
   - Commit message đề xuất: `chore(admin): rename email labels to username in users UI`

## Checklist
- [x] List users hiển thị "Tên đăng nhập"
- [x] Create users hiển thị "Tên đăng nhập"
- [x] Edit users hiển thị "Tên đăng nhập"
- [x] Search placeholder đổi thành "Tìm theo tên, tên đăng nhập"
- [x] Không đổi API/DB (`email` giữ nguyên)
- [x] Type-check pass và commit local