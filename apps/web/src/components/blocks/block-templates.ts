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
  yourAdvice: { title: "Lời khuyên", content: "..." },
};

export function getTemplate(kind: string) {
  const t = JSON_TEMPLATES[kind];
  return t ? JSON.parse(JSON.stringify(t)) : undefined;
}

