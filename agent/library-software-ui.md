# Library Software UI

- Next.js 15 cảnh báo `params` được giải quyết bằng `React.use` trong trang edit, giữ tương thích tương lai.
- Software form hiển thị preview icon: lấy danh sách media image, map theo ID, và thêm thẻ xoá nhanh khi cần.
- Trang danh sách software giờ có thumbnail + tên media nếu tìm thấy; nếu thiếu URL hiển thị fallback "No icon".
- Nhắc: thay đổi dựa vào `api.media.list`, khi số lượng media lớn nên cân nhắc server-side cache hoặc query lọc.
- Khi hoàn tất kiểm tra, chạy `bunx tsc --project apps/web/tsconfig.json --noEmit`; chỉ build khi bạn yêu cầu.
