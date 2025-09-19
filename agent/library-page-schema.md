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
