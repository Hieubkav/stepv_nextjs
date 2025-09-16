export const JSON_TEMPLATES: Record<string, any> = {
  hero: {
    titleLines: ["TẠO RA.", "THU HÚT.", "CHUYỂN ĐỔI."],
    subtitle: "CHUYÊN GIA HÌNH ẢNH 3D...",
    brandLogos: [{ url: "/images/brands/brand-1.png", alt: "Brand 1" }],
    videoUrl: "/hero-glass-video.mp4",
    posterUrl: "/hero-glass.jpg",
    ctas: [
      { label: "Xem thêm", url: "#services" },
      { label: "Tư vấn", url: "#contact" },
    ],
  },
  services: {
    title: "Dịch vụ",
    subtitle: "Những gì chúng tôi làm",
    items: [
      { icon: "", title: "Render 3D", description: "Mô tả ngắn" },
    ],
  },
  stats: { items: [{ label: "Dự án", value: 120 }] },
  gallery: { images: [{ url: "/images/sample.jpg", alt: "Mẫu" }] },
  whyChooseUs: { title: "Vì sao chọn chúng tôi", items: [{ title: "Chất lượng", description: "..." }] },
  why3DVisuals: { title: "Tại sao 3D?", items: [{ title: "Nổi bật", description: "..." }] },
  turning: { title: "Chuyển đổi", items: [{ title: "Bước 1", description: "..." }] },
  weWork: { title: "Quy trình", items: [{ title: "Bước 1", description: "..." }] },
  stayControl: { title: "Kiểm soát", items: [{ title: "Tối ưu", description: "..." }] },
  contactForm: { title: "Liên hệ", recipientEmail: "hello@example.com" },
  wordSlider: { words: ["Từ khóa 1", "Từ khóa 2"] },
  yourAdvice: {
    title: "QUẢNG CÁO CỦA BẠN CÓ THỂ TRÔNG NHƯ THẾ NÀY",
    subtitle:
      "Khám phá cách chúng tôi đã giúp các thương hiệu cao cấp và ngành công nghiệp sáng tạo biến tầm nhìn của họ thành hiện thực với những hình ảnh 3D tuyệt đẹp và được thiết kế riêng.",
    buttons: [
      { text: "KHÁM PHÁ THÊM DỰ ÁN", url: "/projects", style: "primary" },
      { text: "LIÊN HỆ CHÚNG TÔI", url: "#contact", style: "secondary" },
    ],
    videos: [
      { videoId: "EZwwRmLAg90", title: "Oro Bianco | BOIS 1920 | Step V Studio | 3D Animation", linkUrl: "/projects" },
      { videoId: "M7lc1UVf-VE", title: "3D Product Animation - Perfume Bottle", linkUrl: "/projects" },
    ],
    mobileHeight: 400,
  },
};

export function getTemplate(kind: string) {
  const t = JSON_TEMPLATES[kind];
  return t ? JSON.parse(JSON.stringify(t)) : undefined;
}

