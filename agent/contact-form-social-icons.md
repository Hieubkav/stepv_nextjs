# Contact Form & Social Icon Updates

- ContactFormSection.tsx nay nhận đầy đủ props từ CMS (title, subtitle, CTA, contactLinks, socialLinks, fields, privacyText, submitLabel, promiseHighlight) và fallback về dữ liệu mặc định StepV khi thiếu.
- Form dùng FormState động cho mọi field (text/select/textarea/checkbox), reset lại khi cấu hình thay đổi và tách phần đồng ý chính sách để bám theo chuỗi privacyText.
- Social buttons sử dụng getLucideIcon để map key icon → component; hỗ trợ nhiều mạng xã hội mới mà không cần SVG inline.
- pps/web/src/lib/lucide-icons.ts mở rộng với icon Telegram, TikTok, Pinterest, X (Twitter), Zalo (dùng createLucideIcon + path từ Simple Icons) và cập nhật lại ICON_ENTRIES.
- lock-defaults.ts đồng bộ URL + icon mới cho contact block, header và footer nhằm dùng đúng key (Tiktok, Telegram, X, Pinterest, Zalo) so với thư viện mới.
- Khi thêm social khác chỉ cần khai báo path SVG mới bằng createLucideIcon và đăng ký vào ICON_ENTRIES; component front-end đã tự động hiểu.

- 2025-09-22: Bổ sung thuộc tính key cho các icon tuỳ biến (Telegram, TikTok, Pinterest, X, Zalo) trong `apps/web/src/lib/lucide-icons.ts` để tránh cảnh báo React thiếu key.
