- Trả lời tôi bằng tiếng Việt nhé

- Sau khi xây 1 chức năng lớn xong thì nhớ nhắc tôi chạy `bun run --cwd apps/web build` nha vì bạn tự chạy thì sẽ chậm dự án. Nào tôi kêu thì làm. Nhớ chạy `bunx tsc --project apps/web/tsconfig.json --noEmit` trước, xong hết lỗi thì `bun run --cwd apps/web build` đến khi hết lỗi.

- SAP ở đây là combo của 3 chữ: Scaffold, Approach, Pattern

- Các schema.ts thì luôn phải có `order` (để sắp xếp), có `active` (để ẩn/hiện) dĩ nhiên là với các bảng hợp lý ví dụ sản phẩm, danh mục,... Còn 1 số thì không, ví dụ bảng cài đặt với chỉ 1 record

- Với Convex thì khi thực hiện phải đảm bảo tuân thủ rule ở file `convex_rule.md`

- Khi làm xong hoặc hỏi lại người hỏi, hãy phát ra âm thật lớn: `[Console]::Beep(4000, 500)`

## ⚠️ QUY TẮC GIT - RẤT QUAN TRỌNG

**TUYỆT ĐỐI KHÔNG ĐƯỢC** tự ý dùng các lệnh git sau:
- ❌ `git commit` - NỘI QUY: BẠN HỌC VIÊN PHẢI TỰ COMMIT
- ❌ `git push` - NỘI QUY: BẠN HỌC VIÊN PHẢI TỰ PUSH  
- ❌ `git checkout` - NỘI QUY: BẠN HỌC VIÊN PHẢI TỰ CHECKOUT
- ❌ `git reset` - NỘI QUY: BẠN HỌC VIÊN PHẢI TỰ RESET
- ❌ `git rebase` - NỘI QUY: BẠN HỌC VIÊN PHẢI TỰ REBASE
- ❌ Bất kỳ lệnh git nào làm thay đổi history hoặc repository

**ĐƯỢC PHÉP** dùng các lệnh git để XEM thông tin:
- ✅ `git status`
- ✅ `git diff`
- ✅ `git log`

**QUYẾT TẮC**: Sau khi code xong, hãy:
1. Dùng `git diff` để hiển thị thay đổi cho người hỏi
2. Dùng `git status` để kiểm tra trạng thái
3. **DỪNG LẠI - CHỜ NGƯỜI HỎI COMMIT**
4. Chỉ commit khi người hỏi rõ ràng kêu bạn làm 