## Problem Graph
1. [Main] Lỗi runtime do truy cập trực tiếp `params.userId` trong Next.js 15 <- depends on 1.1
   1.1 [ROOT CAUSE] File client component `src/app/(dashboard)/dashboard/user/[userId]/edit/page.tsx` vẫn typed `params: { userId: string }` và truy cập trực tiếp, trong khi Next.js 15 yêu cầu `params` là Promise và unwrap bằng `use(params)`.

## Execution (with reflection)
1. Cập nhật signature + unwrap params theo convention hiện có
   - File: `apps/web/src/app/(dashboard)/dashboard/user/[userId]/edit/page.tsx`
   - Thay đổi:
     - Import `use` từ React: `import { use, useEffect, useState } from "react";`
     - Đổi prop type: `{ params: Promise<{ userId: string }> }`
     - Thêm `const { userId } = use(params);`
   - Reflection: ✓ Đồng bộ pattern với các page dashboard khác (`project`, `post`, `vfx`, ...).

2. Thay toàn bộ truy cập `params.userId` bằng `userId`
   - Các vị trí:
     - `loadUser()` fetch URL
     - dependency array của `useEffect`
     - `handleSubmit()` fetch URL PATCH
     - `handleChangePassword()` fetch URL POST
   - Reflection: ✓ Loại warning migration hiện tại và tránh break khi Next.js bỏ hỗ trợ truy cập trực tiếp.

3. Verify tối thiểu theo rule repo
   - Chạy: `bunx tsc --noEmit -p apps/web/tsconfig.json`
   - Không chạy thêm lint/test trừ khi bạn yêu cầu.
   - Reflection: ✓ Đảm bảo type pass sau chỉnh params Promise.

4. Commit theo quy tắc repo
   - Stage file code + `.factory/docs` (nếu có)
   - Kiểm tra `git diff --cached` + `git status`
   - Commit local (không push) với message gợi ý: `fix(web): unwrap params promise in admin user edit page`

## Checklist
- [ ] Sửa `page.tsx` dùng `use(params)`
- [ ] Replace toàn bộ `params.userId` -> `userId`
- [ ] Chạy `bunx tsc --noEmit -p apps/web/tsconfig.json`
- [ ] Commit local, kèm `.factory/docs` nếu có

## Best practice áp dụng
- Với Next.js 15 App Router, luôn xem `params` là Promise ở page/layout và unwrap bằng `use(params)` (client) hoặc `await params` (server).
- Tránh dùng trực tiếp `params.xxx` để không bị lỗi khi framework bỏ backward compatibility.