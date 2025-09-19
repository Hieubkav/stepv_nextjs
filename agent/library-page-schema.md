# Thu-vien schema setup

## Context
- Tao bang Convex cho trang /thu-vien gom resource, resource_image, software va bang mapping.
- Moi bang deu co truong order + active de sap xep va an/hien theo yeu cau chung.

## Chi tiet chinh
- library_resources: slug duy nhat, pricingType (free|paid), downloadUrl + isDownloadVisible, mo ta + features.
- library_resource_images: luu nhieu anh chi tiet theo thu tu, tham chieu media.
- library_softwares: danh sach phan mem kem icon (media) va officialUrl.
- library_resource_softwares: bang n-n, co order de uu tien phan mem hien len va assignedAt de audit.
- Chi so: by_slug, by_pricing_order/by_active_order cho resource; by_resource_order/by_media cho anh; by_slug/by_active_order cho software; mapping gom by_resource_order/by_software/by_pair.

## Next time nho
- Dao tao data se can mutation update createdAt/updatedAt/assignedAt dung thong so timestamp.
- Khi render UI co the de y isDownloadVisible de quyet dinh hien nut tai.

## API mutations/queries
- listResources + getResourceDetail ho tro bo loc active, pricingType va join software/anh.
- CRUD resource: createResource, updateResource, setResourceActive, deleteResource (xoa ca image va mapping).
- CRUD software: createSoftware, updateSoftware, setSoftwareActive, deleteSoftware (don mapping lien quan).
- Resource images: listResourceImages, createResourceImage (auto order neu ko truyen), updateResourceImage, deleteResourceImage, reorderResourceImages.
- Mapping n-n: listResourceSoftwares, assignSoftwareToResource (update neu ton tai), updateResourceSoftware, removeResourceSoftware.
- Helpers dam bao slug duy nhat va chuan hoa features (loai bo chuoi rong, unique).

## Dashboard library admin
- Trang /dashboard/library (list) + /dashboard/library/new và /dashboard/library/[id]/edit dùng form riêng cho create/update (features nhập mỗi dòng, order swap bằng patch hai record).
- Sidebar/topnav có link 'Thu vien' và 'Phan mem'; command palette tự cập nhật từ sidebarData.
- CRUD phan mem: /dashboard/library/software (list) + routes /software/new, /software/[id]/edit (api.library.listSoftwares...).
