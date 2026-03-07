## Problem Graph
1. Sửa lại layout đúng ý user <- depends on 1.1, 1.2
   1.1 Hoàn tác phần list đã nới rộng sai phạm vi
      1.1.1 ROOT CAUSE: trước đó thêm `-mx-4` vào 2 bảng list
   1.2 Chỉ nới rộng form tạo/cập nhật vai trò
      1.2.1 Đổi card form roles từ `max-w-3xl` sang full width

## Execution (with reflection)
1. Revert bảng user list về như cũ
   - File: `apps/web/src/app/(dashboard)/dashboard/user/page.tsx`
   - Change: đổi `className="-mx-4 divide-y rounded-md border"` -> `className="divide-y rounded-md border"`.
   - Reflection: ✓ Bảng `/dashboard/user` trở về layout cũ.

2. Revert bảng roles list về như cũ
   - File: `apps/web/src/app/(dashboard)/dashboard/user/roles/page.tsx`
   - Change: ở khối “Danh sách vai trò”, đổi `-mx-4 divide-y...` -> `divide-y...`.
   - Reflection: ✓ Bảng list roles không còn full-width.

3. Chỉ nới rộng card form tạo/cập nhật vai trò
   - File: `apps/web/src/app/(dashboard)/dashboard/user/roles/page.tsx`
   - Change: đổi `<Card className="max-w-3xl">` -> `<Card>` (hoặc `w-full`).
   - Reflection: ✓ Form chiếm full chiều ngang trong vùng content, đúng yêu cầu mới.

4. Verify + commit theo rule repo
   - Run: `bunx tsc --project apps/web/tsconfig.json --noEmit`.
   - Commit local (không push), include cả `.factory/docs` nếu có.

## Checklist
- [ ] `/dashboard/user`: bảng list quay lại như cũ
- [ ] `/dashboard/user/roles`: bảng “Danh sách vai trò” quay lại như cũ
- [ ] `/dashboard/user/roles`: card “Tạo/Cập nhật vai trò” full-width
- [ ] Typecheck pass
- [ ] Đã commit, chưa push