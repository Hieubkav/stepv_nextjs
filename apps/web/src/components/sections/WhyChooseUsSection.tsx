'use client';

import React, { useMemo } from 'react';
import { getLucideIcon } from '@/lib/lucide-icons';

interface WhyItem {
  icon: string;
  title: string;
  description: string;
}

interface WhyChooseUsSectionProps {
  title?: string;
  subtitle?: string;
  videoUrl?: string;
  videoPoster?: string;
  videoAlt?: string;
  items?: WhyItem[];
  ctaText?: string;
  ctaLink?: string;
}

const DEFAULT_ITEMS: WhyItem[] = [
  {
    icon: "Gem",
    title: "CHUYÊN MÔN CAO CẤP",
    description: "Chúng tôi chuyên về nước hoa và làm đẹp, đảm bảo mỗi chi tiết phản ánh sự tinh tế của thương hiệu bạn."
  },
  {
    icon: "Cog",
    title: "GIẢI PHÁP TÙY CHỈNH",
    description: "Mỗi dự án được tùy chỉnh theo bản sắc riêng của bạn để hình ảnh của bạn nổi bật trong thị trường đông đúc."
  },
  {
    icon: "Award",
    title: "CHẤT LƯỢNG ĐÃ ĐƯỢC CHỨNG MINH",
    description: "Danh mục của chúng tôi bao gồm các tác phẩm cho các thương hiệu cao cấp như GAZZAZ, G'DIVINE và CARON PARIS, thể hiện khả năng mang lại kết quả đẳng cấp thế giới."
  },
];

const DEFAULT_VIDEO_POSTER = "https://stepv.studio/wp-content/uploads/2025/03/BTSO-1-2.png";
const DEFAULT_VIDEO_ALT = "Why Choose Us video";
const DEFAULT_TITLE = 'TẠI SAO CÁC THƯƠNG HIỆU TIN TƯỞNG DOHY MEDIA';
const DEFAULT_SUBTITLE = 'Chúng tôi chuyên tạo ra những hình ảnh 3D siêu thực và hoạt hình được thiết kế riêng cho ngành nước hoa và làm đẹp. Chuyên môn của chúng tôi giúp các thương hiệu cao cấp thu hút khán giả, nâng cao cách trình bày sản phẩm và nổi bật trong thị trường cạnh tranh.';
const DEFAULT_CTA_TEXT = 'TÌM HIỂU VỀ QUY TRÌNH CỦA CHÚNG TÔI';
const DEFAULT_CTA_LINK = "#process";

const extractYouTubeId = (input?: string) => {
  if (!input) return null;
  const match = input.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : null;
};

const WhyChooseUsSection = ({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  videoUrl,
  videoPoster = DEFAULT_VIDEO_POSTER,
  videoAlt = DEFAULT_VIDEO_ALT,
  items,
  ctaText = DEFAULT_CTA_TEXT,
  ctaLink = DEFAULT_CTA_LINK,
}: WhyChooseUsSectionProps) => {
  const featureItems = items && items.length > 0 ? items : DEFAULT_ITEMS;
  const youTubeId = useMemo(() => extractYouTubeId(videoUrl), [videoUrl]);
  const showVideo = Boolean(videoUrl);
  const FeatureIcon = (icon: string) => getLucideIcon(icon);

  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light uppercase text-white leading-tight mb-8">
            {title}
          </h2>
          <p className="text-lg md:text-xl font-light leading-relaxed text-gray-300 lg:w-3/5">
            {subtitle}
          </p>
          <a
            href={ctaLink}
            className="inline-flex items-center gap-3 px-8 py-3 border border-white rounded-2xl text-white text-sm uppercase font-medium hover:bg-white hover:text-black transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {ctaText}
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative w-full">
            <div
              className="relative overflow-hidden min-h-[600px] bg-cover bg-center bg-no-repeat"
              style={{
                borderRadius: '25px',
                backgroundImage: videoPoster ? `url(${videoPoster})` : undefined,
              }}
            >
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ borderRadius: '25px' }}
              >
                {showVideo ? (
                  youTubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youTubeId}?controls=0&rel=0&playsinline=1&autoplay=1&mute=1&loop=1&playlist=${youTubeId}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      title={videoAlt}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ pointerEvents: 'none' }}
                      loading="lazy"
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                      poster={videoPoster}
                    />
                  )
                ) : null}
              </div>

              <div className="relative z-10 p-8 h-full flex flex-col justify-end pointer-events-auto">
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">CHUYÊN MÔN 3D CAO CẤP</h3>
                  <p className="text-sm opacity-90">Khám phá quy trình sản xuất video 3D chuyên nghiệp của chúng tôi</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {featureItems.map((feature, index) => {
              const Icon = FeatureIcon(feature.icon);
              return (
                <div key={`${feature.title}-${index}`} className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-700 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <Icon className="text-2xl text-yellow-400" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
