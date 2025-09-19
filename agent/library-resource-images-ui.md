# Library Resource Images UI

- Resource form nay co picker cover: dung `useQuery(api.media.list)` + `Dialog` de chon, preview fallback neu khong co URL, va nut xoa nhanh.
- Trang edit su dung `ResourceImagesManager` (Card rieng) de list anh theo order, toggle active, move up/down (goi `reorderResourceImages`), va xoa.
- Dialog them anh cho phep multi select, loai bo media da gan, xu ly tung phan tu de giu thu tu, co trang thai loading + disable khi chua chon.
- Khi khong co media hien san, thong bao nguoi dung tai anh o trang Media.
- Nho cap nhat toast thong bao cho cac hanh dong quan trong (add/delete/reorder) va reset state khi dong modal.
- Radix Checkbox render thanh <button>, tranh long trong nut chon media: dung <div role="button" tabIndex=0> kem onKeyDown cho Enter/Space de giu accessibility.

