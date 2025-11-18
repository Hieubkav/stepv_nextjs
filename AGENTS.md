# Project Guidelines

## ⚠️ QUY TẮC GIT
❌ **KHÔNG tự**: commit, push, checkout, reset, rebase, thay đổi history
✅ **CHỈ dùng**: git status, git diff, git log

## Custome Rule
- ✅ **Tiếng Việt** luôn
- ✅ **Build**: chạy `bunx tsc --project apps/web/tsconfig.json --noEmit` trước, rồi `bun run --cwd apps/web build` khi code xong chức năng lớn (báo trước, đừng tự chạy)
- ✅ **Schema.ts**: thêm `order` & `active` cho bảng động (sản phẩm, danh mục,...)
- ✅ **Convex**: tuân thủ `convex_rule.md`
- ✅ **Khi xong**: `[Console]::Beep(4000, 500)`

## Code Style  
- Use TypeScript strict mode
- Prefer composition over inheritance
- Keep functions under 20 lines