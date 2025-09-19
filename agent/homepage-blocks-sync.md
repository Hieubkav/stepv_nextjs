# Homepage Blocks Sync Notes

- Cập nhật mapper page.tsx để hỗ trợ dữ liệu động cho why3D (cards), weWork (ctas), stayControl (items), contact (form fields, links, socials).
- Các section Why3DVisualsSection, WeWorkSection, StayControlSection, ContactFormSection đã nhận props thực; fallback mặc định vẫn giữ nguyên dữ liệu mẫu.
- WeWork: dùng DEFAULT_STEPS, DEFAULT_CTAS; reset ctiveStep khi dữ liệu thay đổi; nút CTA render theo ctas từ CMS.
- StayControl: chấp nhận subtitle, items đơn giản; tự nhóm theo ow hoặc chia cặp, icon optional.
- ContactForm: render field động, social/cta/link lấy từ Convex; ields thiếu thì fallback DEFAULT_FIELDS.
- Nếu block mới thêm field, chỉ cần mở rộng mapper + component tương ứng; chú ý kiểm tra icon (Lucide) và dữ liệu rỗng.

- SiteHeader + SiteFooter: them mapper lay menu/social/button/location tu CMS, ho tro highlight boolean va tach dong dia chi bang split newline.
- Chuyen cac the Link dong sang the a khi url co the ngoai he thong de tranh loi Route type; da lam voi header/footer menu va email.
- Lam sach lai Why3D/WeWork/StayControl/ContactForm de tranh template literal sai khi map du lieu tu CMS.
