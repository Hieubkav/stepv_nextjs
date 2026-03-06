## Problem Graph
1. `bun dev:server` fail vì Convex không resolve được `crypto` <- depends on 1.1, 1.2
   1.1 `convex/lib/password.ts` import Node built-in `crypto` nhưng không ở Node runtime [ROOT CAUSE]
   1.2 `adminAuth.ts` và `adminUsers.ts` đang import trực tiếp password lib nên bị kéo theo vào bundle runtime mặc định
2. Rà soát nguy cơ tương tự <- depends on 2.1
   2.1 Tìm các file Convex khác import Node built-in mà thiếu `"use node"`

## Execution (with reflection)
1. Solving 1.1.1 (root cause): tách password hashing sang node-only module
   - Tạo file mới `packages/backend/convex/lib/password.node.ts` với `'use node'` ở đầu file, chứa `hashPassword` + `verifyPassword` dùng `crypto`.
   - Giữ nguyên format hash hiện tại (`pbkdf2$...`) để không làm invalid dữ liệu cũ.
   - Reflection: ✓ An toàn, không đổi schema/data.

2. Solving 1.2: cập nhật import ở module admin
   - Sửa `packages/backend/convex/adminAuth.ts`: đổi import từ `./lib/password` -> `./lib/password.node`.
   - Thêm `'use node'` vào đầu `adminAuth.ts` để toàn bộ mutation/query trong file chạy Node runtime tương thích.
   - Sửa `packages/backend/convex/adminUsers.ts`: đổi import tương tự + thêm `'use node'` ở đầu file.
   - Reflection: ✓ Đúng yêu cầu “sửa chuẩn”, phạm vi gói gọn vào admin auth/users.

3. Rà soát file tương tự dễ lỗi runtime
   - Quét toàn bộ `packages/backend/convex` để tìm import Node built-ins (`crypto`, `fs`, `path`, `os`, `stream`, `buffer`, `util`, `zlib`, `net`, `tls`, `http`, `https`, `child_process`, `url`, `events`) và xác minh có `'use node'` hay chưa.
   - Với phát hiện mới (nếu có), áp dụng cùng pattern: tách node-only hoặc thêm `'use node'` đúng file chứa Node API.
   - Reflection: ✓ Giảm rủi ro lỗi runtime lặp lại khi dev/deploy.

4. Verify theo rule repo
   - Chạy `bunx tsc --noEmit` (theo AGENTS.md).
   - Chạy `bun dev:server` để xác nhận Convex prepare functions pass (không còn lỗi resolve `crypto`).
   - Reflection: ✓ Đúng tiêu chí done của bug hiện tại.

5. Commit (theo AGENTS.md)
   - `git status` + kiểm tra diff không chứa secret/env.
   - Commit với message kiểu: `fix(backend): move password crypto to node runtime for convex admin auth`.
   - Nếu có `.factory/docs` thay đổi thì add kèm vào commit đúng rule.

## Checklist hoàn thành
- [ ] Không còn import `crypto` ở module không Node runtime.
- [ ] `adminAuth` và `adminUsers` dùng password helper node-only.
- [ ] Rà soát xong các file Convex có Node built-ins.
- [ ] `bunx tsc --noEmit` pass.
- [ ] `bun dev:server` chạy qua bước prepare functions.
- [ ] Đã commit local, chưa push.

Best practice áp dụng cho dự án này: mọi Convex function chạm Node API nên cô lập vào file node-only (`'use node'`) để tránh bundle lỗi và giữ boundary runtime rõ ràng.