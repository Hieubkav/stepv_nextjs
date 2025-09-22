# Library frontend pages

## Context
- Xây mới UI cho `/thu-vien` (danh sách) và `/thu-vien/[slug]` (chi tiết) dựa trên dữ liệu Convex hiện có.
- Tận dụng `api.library.listResources`, `api.library.listSoftwares`, `api.library.getResourceDetail` + `api.media.list`.

## Ghi chú nhanh
- Danh sách resource cần fetch thêm detail qua `ConvexReactClient` (xem `extras` trong `library-list-view.tsx`) để lấy mapping phần mềm.
- Khi filter theo phần mềm, vẫn hiển thị resource trong lúc detail chưa về để tránh blink, nhưng badge chỉ render sau khi có `extras`.
- `ConvexHttpClient` được preload ở server cho trang chi tiết, nhớ fallback `undefined` nếu thiếu `CONVEX_URL` để tránh 404 giả.
- CTA section tái sử dụng dark gradient, nên tái dùng `Button` với `asChild` và anchor để tránh conflict với `next/link` khi mở external link.
- Nếu thêm field mới (ví dụ giá cụ thể), mở rộng `LibraryResourceDoc` trong `features/library/types.ts` rồi map lại ở card & sidebar.

## Quy trình kiểm tra
- `bunx tsc --project apps/web/tsconfig.json --noEmit` trước khi báo cáo.
- Nhắc PM tự chạy `bun run --cwd apps/web build` vì build Bun lâu.
- Update (filters + detail): Filter pills & price buttons chuyển sang theme đen/vàng, detail gallery hỗ trợ click thumbnail đổi ảnh chính, bỏ CTA tĩnh cuối trang.
- Update (back link): sử dụng useRouter.push cho nút 'Quay lại thư viện' để đảm bảo redirect đúng /thu-vien.
- Update (Next dynamic params): trang \/thu-vien/[slug]\ ph?i \wait params\ tr??c khi l?y \slug\ (Next.js warning sync dynamic APIs).
