## Huong dan debug trang khoa hoc (site)

- Danh sach khoa hoc nam tai `/khoa-hoc`. Trang nay goi `api.courses.listCourses` (includeInactive=true), sap xep theo `order`, va tao link chi tiet `/khoa-hoc/{order}`.
- Trang chi tiet su dung tham so `order` (so nguyen). Server se tim course co `order` trung khop va goi `api.courses.getCourseDetail` bang `id` cua course nay; neu khong tim thay se hien payload `debug` voi danh sach `availableOrders`.
- Neu `CONVEX_URL` khong duoc dat, UI se hien thong bao rong va ghi log canh bao trong server console.
- Bang danh sach co nut “Mo chi tiet” de mo nhanh trang `/khoa-hoc/{order}`.
- Trang chi tiet hien JSON voi ba phan: `course`, `chapters`, va `debug` (ly do loi, order tim thay, danh sach order hien co).

### Checklist khi bi 404 hoac khong co du lieu

1. **Kiem tra order**
   - Dam bao moi course co gia tri `order` khac nhau.
   - Link tren trang danh sach se dua theo order, neu trung nhau co the dan toi chi tiet sai.

2. **Kiem tra du lieu Convex**
   ```bash
   cd packages/backend
   bunx convex run courses:listCourses '{"includeInactive":true}'
   ```
   - Thay order va `_id` co trung khop voi duong dan muon truy cap khong.

3. **Test truy van chi tiet**
   ```bash
   bunx convex run courses:getCourseDetail '{"id":"<courseId>","includeInactive":true}'
   ```
   - Neu query tra ve `null` thi course da bi xoa hoac `id` sai.

4. **Log server**
   - Console Next.js se ghi `Khong the tai danh sach khoa hoc` hoac `Khong the tai chi tiet khoa hoc` neu fetch that bai.
   - Kiem tra ket noi internet hoac `CONVEX_URL`.

### Luu y
- Dashboard CRUD khong bi anh huong, tiep tuc lam viec voi slug + logic cu neu can.
- Site hien khong yeu cau dang nhap. Moi thong tin preview chi hien thi dang bang don gian de tham khao.
- Khi them course moi, cap nhat `order` hop ly de duong dan `/khoa-hoc/{order}` hoat dong.
