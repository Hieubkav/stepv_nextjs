# I. Primer

## 1. TL;DR kiểu Feynman
- Thêm một thư mục dữ liệu mới có tên là **Web Demo** vào hệ thống trang web quản trị của DOHY.
- Giúp người quản lý (Admin) có thể thêm, sửa, xóa, và kéo thả sắp xếp các mẫu giao diện web demo trực tiếp trên màn hình dashboard.
- Ở trang ngoài cho khách hàng (Public), tạo một trang `/theme-demo` hiển thị danh sách các mẫu giao diện và trang `/theme-demo/{slug}` để xem chi tiết từng mẫu cực kỳ đẹp mắt với hình ảnh máy tính và điện thoại lồng nhau sống động.
- Dữ liệu đánh giá (reviews) và các phần giao diện cấu thành (blocks) của mẫu web demo sẽ được cất gọn gàng vào trong chính nó thay vì đẻ ra nhiều bảng khác, giúp hệ thống chạy nhanh nhất và đơn giản nhất.

## 2. Elaboration & Self-Explanation
- **Vấn đề cần giải quyết**: Khách hàng DOHY muốn có một hệ thống trưng bày các mẫu giao diện web demo sẵn có (như Spa, Bất động sản, E-commerce...) tương tự một dự án snapshot mẫu. Hệ thống này cần có trang quản trị đầy đủ tính năng CRUD và kéo thả sắp xếp, đồng thời trang hiển thị phía ngoài cho người dùng phải có giao diện hiện đại, chuyên nghiệp, hiển thị trực quan mockup thiết bị (Laptop & Mobile) cùng cấu trúc block giao diện và phản hồi khách hàng.
- **Nguyên nhân & Hướng tiếp cận**: Để tránh nợ kỹ thuật (Technical Debt) và nợ thiết kế (Design Debt), chúng ta sẽ không tạo nhiều bảng phụ rời rạc như `web_demo_blocks` và `web_demo_reviews` mà tận dụng khả năng lưu trữ cấu trúc dạng mảng (Array of Objects) của Convex DB. Việc này đảm bảo lấy toàn bộ thông tin chi tiết của 1 theme demo chỉ qua **1 Query duy nhất**, loại bỏ hoàn toàn vấn đề N+1 query và độ trễ do JOIN bảng.
- **Thiết kế UI/UX**:
  - *Trang Admin*: Tái sử dụng form pattern của `ProjectForm`, tích hợp `MediaPickerDialog` để chọn ảnh dễ dàng, có live preview trực tiếp và các nút di chuyển (Move Up/Down) cho danh sách Blocks giúp nâng cao tính khả dụng (Usability).
  - *Trang Public*: Dùng CSS Grid và Flexbox linh hoạt để hiển thị mockup Laptop & Mobile đè lệch góc có chiều sâu, tạo cảm giác premium sống động. Dùng các tag badges hiển thị ngay bộ lọc.

## 3. Concrete Examples & Analogies
- **Ví dụ thực tế**: Khi Admin muốn thêm một giao diện "Dr.Thoang DermaCos Cần Thơ":
  - Admin vào Dashboard -> Web Demo -> Thêm mới.
  - Nhập tên, slug, tải lên ảnh Laptop, ảnh Mobile từ thư viện Media có sẵn.
  - Thêm 3 blocks giao diện (Hero Section, Dịch vụ nổi bật, Footers) kèm ảnh minh họa cho mỗi block.
  - Thêm 1 review của bác sĩ Thoang: "Giao diện rất mượt".
  - Bấm lưu. Giao diện này sẽ hiển thị ngay lập tức ngoài trang `/theme-demo`. Khi bấm vào xem chi tiết, ảnh điện thoại sẽ đè nhẹ lên góc dưới bên phải màn hình laptop giống như ta đặt một chiếc iPhone thật cạnh một chiếc Macbook.
- **Phép ẩn dụ**: Việc lưu trữ Blocks và Reviews chung trong bảng chính giống như ta đóng gói một bộ đồ chơi lắp ráp hoàn chỉnh vào một chiếc hộp duy nhất. Khi cần chơi, ta chỉ việc lấy chiếc hộp đó ra (1 query). Nếu chia nhỏ ra nhiều bảng phụ, nó giống như ta cất mỗi chi tiết đồ chơi ở một ngăn tủ khác nhau, khi chơi lại phải đi tìm và nhặt từng mảnh ở các nơi (nhiều query join phức tạp), rất tốn thời gian và dễ thất lạc.

# II. Audit Summary (Tóm tắt kiểm tra)
- **Tình trạng codebase**:
  - Backend Convex sử dụng mô hình schema tĩnh được cấu hình tại `packages/backend/convex/schema.ts`.
  - Frontend Next.js sử dụng App Router, có tổ chức routing phân nhóm rõ ràng (site public nằm ở `(site)/*`, dashboard quản trị nằm ở `(dashboard)/dashboard/*`).
  - Giao diện có sẵn thư viện chọn ảnh tập trung `MediaPickerDialog` tại `@/components/media/media-picker-dialog` được dùng phổ biến ở các form quản trị như Project hay VFX.
  - Toàn bộ layout dashboard kế thừa từ `AuthenticatedLayout` và nhận dữ liệu sidebar từ `sidebar-data.ts`.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Độ tin cậy nguyên nhân gốc**: High (Do đây là tính năng mới cần bổ sung hoàn toàn từ đầu nên nguyên nhân của việc thiếu tính năng là do chưa phát triển schema và các page tương ứng).
- **Giả thuyết đối chứng**: 
  - *Giả thuyết 1 (Phức tạp)*: Tạo các bảng Convex riêng cho `web_demo_blocks` và `web_demo_reviews`, thực hiện JOIN trong code backend.
    - *Kết quả*: Phức tạp hóa schema, tăng thời gian phát triển, sinh ra Technical Debt và có nguy cơ gặp lỗi N+1 khi hiển thị danh sách nếu code không tối ưu.
  - *Giả thuyết 2 (MVP KISS - Recommended)*: Lưu trực tiếp reviews và blocks vào dạng mảng bên trong bảng `web_demos`.
    - *Kết quả*: Code tinh gọn, thực thi nhanh chóng, dữ liệu tập trung, hiệu năng truy vấn tối đa.

# IV. Proposal (Đề xuất)
- **Phương án đề xuất**: Thiết lập schema bảng `web_demos` sử dụng cấu trúc lưu trữ mảng lồng cho reviews và blocks. Viết Convex API CRUD trong `web_demos.ts`. Tích hợp route quản lý vào sidebar. Xây dựng Form admin có live preview và drag-reorder danh sách blocks. Xây dựng trang danh sách và trang chi tiết public với style premium và mockup thiết bị overlapping mượt mà.

# V. Files Impacted (Tệp bị ảnh hưởng)

### UI / Admin Dashboard
- **Sửa:** [sidebar-data.ts](file:///e:/NextJS/job/dohyy/dohy/apps/web/src/components/layout/data/sidebar-data.ts)
  - Mô tả: Thêm link "Web Demo" vào phần nhóm QUẢN LÝ của sidebar.
- **Thêm:** [web-demo-form.tsx](file:///e:/NextJS/job/dohyy/dohy/apps/web/src/app/(dashboard)/dashboard/web-demo/_components/web-demo-form.tsx)
  - Mô tả: Form quản trị nhập liệu chi tiết Web Demo có tích hợp MediaPickerDialog và quản lý reviews/blocks động.
- **Thêm:** [page.tsx](file:///e:/NextJS/job/dohyy/dohy/apps/web/src/app/(dashboard)/dashboard/web-demo/page.tsx)
  - Mô tả: Trang danh sách quản trị Web Demo có kéo thả sắp xếp vị trí và bật/tắt hiển thị nhanh.
- **Thêm:** [page.tsx](file:///e:/NextJS/job/dohyy/dohy/apps/web/src/app/(dashboard)/dashboard/web-demo/new/page.tsx)
  - Mô tả: Trang thêm mới Web Demo.
- **Thêm:** [page.tsx](file:///e:/NextJS/job/dohyy/dohy/apps/web/src/app/(dashboard)/dashboard/web-demo/[id]/edit/page.tsx)
  - Mô tả: Trang chỉnh sửa Web Demo.

### UI / Public Pages
- **Thêm:** [page.tsx](file:///e:/NextJS/job/dohyy/dohy/apps/web/src/app/(site)/theme-demo/page.tsx)
  - Mô tả: Trang danh sách giao diện public `/theme-demo` có bộ lọc tags và thanh tìm kiếm mượt mà.
- **Thêm:** [page.tsx](file:///e:/NextJS/job/dohyy/dohy/apps/web/src/app/(site)/theme-demo/[slug]/page.tsx)
  - Mô tả: Trang chi tiết mẫu giao diện `/theme-demo/{slug}` hiển thị mockup Laptop & Mobile lồng nhau và các block cấu thành mẫu.

### Server / Backend
- **Sửa:** [schema.ts](file:///e:/NextJS/job/dohyy/dohy/packages/backend/convex/schema.ts)
  - Mô tả: Thêm bảng `web_demos` vào cấu trúc DB.
- **Thêm:** [web_demos.ts](file:///e:/NextJS/job/dohyy/dohy/packages/backend/convex/web_demos.ts)
  - Mô tả: Các hàm Convex API CRUD (`list`, `getDetail`, `create`, `update`, `delete`, `setActive`, `reorder`).

# VI. Execution Preview (Xem trước thực thi)
1. **Đọc & Chỉnh sửa Schema**: Thêm bảng `web_demos` vào `schema.ts`.
2. **Đồng bộ cơ sở dữ liệu**: Chạy codegen tạo types mới.
3. **Viết API Backend**: Viết logic Convex functions cho `web_demos.ts` tuân thủ các quy tắc DB optimization.
4. **Nối Sidebar**: Cập nhật file `sidebar-data.ts`.
5. **Xây dựng Form Admin**: Phát triển component `web-demo-form.tsx`.
6. **Xây dựng Trang Admin**: Tạo các trang list, new, edit trong dashboard.
7. **Xây dựng Trang Public**: Phát triển giao diện `/theme-demo` và trang chi tiết `/theme-demo/[slug]`.
8. **Review Tĩnh**: Tự kiểm tra kiểu dữ liệu, các edge cases null-safety và sự tương thích.

# VII. Verification Plan (Kế hoạch kiểm chứng)
- **Loại kiểm chứng**: Typecheck & Manual Testing.
- **Kế hoạch**:
  - Chạy `bunx tsc --project apps/web/tsconfig.json --noEmit` để đảm bảo code compile thành công không có lỗi type.
  - Chạy ứng dụng local và thao tác tay kiểm tra hoạt động của Admin Form (tạo mới, upload mockup laptop/mobile, thêm review, thêm block, lưu và sửa).
  - Kiểm tra trang public có render đúng các thông tin, ảnh mockup lồng nhau co giãn tốt trên điện thoại không, bộ lọc tag có chạy đúng không.

# VIII. Todo
- [ ] Cấu hình bảng `web_demos` trong `schema.ts`.
- [ ] Chạy lệnh `bun dev:server` hoặc `npx convex dev` để đồng bộ DB schema.
- [ ] Tạo file `packages/backend/convex/web_demos.ts` chứa các hàm Convex API CRUD.
- [ ] Sửa `sidebar-data.ts` để bổ sung link Web Demo vào Admin Sidebar.
- [ ] Viết component `web-demo-form.tsx` xử lý UI Form thêm/sửa Web Demo.
- [ ] Viết trang list `apps/web/src/app/(dashboard)/dashboard/web-demo/page.tsx` hỗ trợ kéo thả sắp xếp (drag and drop) và active toggle.
- [ ] Viết trang new `apps/web/src/app/(dashboard)/dashboard/web-demo/new/page.tsx` và trang edit `apps/web/src/app/(dashboard)/dashboard/web-demo/[id]/edit/page.tsx`.
- [ ] Tạo trang public list `apps/web/src/app/(site)/theme-demo/page.tsx` có các tab filter.
- [ ] Tạo trang public detail `apps/web/src/app/(site)/theme-demo/[slug]/page.tsx` có mockup thiết bị overlapping và danh sách blocks giao diện.
- [ ] Chạy typechecking để kiểm tra toàn cục.
- [ ] Phát ra âm báo hoàn thành task `Done, Sir.` qua powershell.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- **Tiêu chí Pass**:
  - Thêm, sửa, xóa Web Demo thành công trong admin dashboard.
  - Sắp xếp vị trí kéo thả danh sách trong admin lưu lại thứ tự chính xác lên database.
  - Giao diện public `/theme-demo` hiển thị đầy đủ danh sách theme active dạng grid, lọc theo các tab category hoạt động đúng.
  - Giao diện chi tiết `/theme-demo/{slug}` hiển thị đầy đủ thông tin: Ảnh laptop & mobile hiển thị dạng overlapping đẹp mắt, các stats hiển thị rõ ràng, hiển thị đúng các block cấu thành cùng ảnh minh họa, reviews khách hàng hiển thị dạng card.
  - Trình biên dịch TypeScript chạy thành công không có lỗi type.
- **Tiêu chí Fail**:
  - Bị lỗi vỡ giao diện mockup thiết bị trên mobile.
  - Bị lỗi N+1 query hoặc tốc độ phản hồi trang chi tiết chậm.
  - Xóa Web Demo nhưng không xóa hoặc làm rỗng các ảnh liên kết gây mồ côi dữ liệu (hoặc không soft-delete đúng chuẩn).

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- **Rủi ro**: Khi đồng bộ schema Convex có thể gây conflict nếu các thay đổi không tương thích ngược. Tuy nhiên vì đây là bảng mới (`web_demos`), rủi ro này cực kỳ thấp.
- **Hoàn tác**: Sử dụng `git checkout --` cho các file code và xóa file Convex `web_demos.ts` nếu cần rollback hoàn toàn.

# XI. Out of Scope (Ngoài phạm vi)
- Hệ thống thanh toán mua bán giao diện trực tiếp (chỉ hỗ trợ trưng bày, xem link demo trực tiếp và nút yêu cầu tư vấn).
- Không tự động sync code giao diện từ host khác về hệ thống (chỉ chụp screenshot lưu dạng media).
