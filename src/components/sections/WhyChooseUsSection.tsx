'use client';

import { useState } from 'react';
import Image from 'next/image';

interface WhyChooseUsSectionProps {
  title?: string;
  subtitle?: string;
  videoId?: string;
  videoPlaceholder?: string;
}

const WhyChooseUsSection = ({
  title = 'TẠI SAO CÁC THƯƠNG HIỆU TIN TƯỞNG DOHY MEDIA',
  subtitle = 'Chúng tôi chuyên tạo ra những hình ảnh 3D siêu thực và hoạt hình được thiết kế riêng cho ngành nước hoa và làm đẹp. Chuyên môn của chúng tôi giúp các thương hiệu cao cấp thu hút khán giả, nâng cao cách trình bày sản phẩm và nổi bật trong thị trường cạnh tranh.',
  videoId = 'GXppDZ0k2IM',
  videoPlaceholder = 'https://stepv.studio/wp-content/uploads/2025/03/BTSO-1-2.png'
}: WhyChooseUsSectionProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  const features = [
    {
      icon: 'fas fa-gem',
      title: 'CHUYÊN MÔN CAO CẤP',
      desc: 'Chúng tôi chuyên về nước hoa và làm đẹp, đảm bảo mọi chi tiết phản ánh sự tinh tế của thương hiệu bạn.'
    },
    {
      icon: 'fas fa-cogs',
      title: 'GIẢI PHÁP TÙY CHỈNH',
      desc: 'Mỗi dự án được tùy chỉnh theo bản sắc riêng của bạn, vì vậy hình ảnh của bạn nổi bật trong thị trường đông đúc.'
    },
    {
      icon: 'fas fa-award',
      title: 'CHẤT LƯỢNG ĐÃ ĐƯỢC CHỨNG MINH',
      desc: 'Danh mục của chúng tôi bao gồm các tác phẩm cho các thương hiệu cao cấp như GAZZAZ, G\'DIVINE và CARON PARIS, thể hiện khả năng mang lại kết quả đẳng cấp thế giới.'
    }
  ];

  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light uppercase text-white leading-tight mb-8">
            {title}
          </h2>
          <p className="text-lg md:text-xl font-light leading-relaxed text-gray-300 lg:w-3/5">
            {subtitle}
          </p>
          <button className="inline-flex items-center gap-3 px-8 py-3 border border-white rounded-2xl text-white text-sm uppercase font-medium hover:bg-white hover:text-black transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            TÌM HIỂU VỀ QUY TRÌNH CỦA CHÚNG TÔI
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Image */}
          <div className="relative">
            {!isVideoPlaying ? (
              // Image Placeholder
              <div className="relative overflow-hidden rounded-3xl bg-gray-800 min-h-[600px]">
                <div
                  className="relative w-full h-full cursor-pointer group"
                  onClick={handlePlayVideo}
                >
                  <Image
                    src={videoPlaceholder}
                    alt="Perfume Product Showcase"
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=600&fit=crop&crop=center';
                    }}
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Video Container with proper aspect ratio
              <div className="relative overflow-hidden rounded-3xl bg-gray-800">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&playsinline=1`}
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    title="Why Choose Us Video"
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-700 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <i className={`${feature.icon} text-2xl text-yellow-400`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Smooth hover animations */
        .group {
          will-change: transform;
        }

        /* Custom hover effects */
        .group:hover img {
          filter: brightness(1.1) contrast(1.05);
        }

        /* Feature cards animation */
        .space-y-6 > div {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        .space-y-6 > div:nth-child(1) { animation-delay: 0.1s; }
        .space-y-6 > div:nth-child(2) { animation-delay: 0.2s; }
        .space-y-6 > div:nth-child(3) { animation-delay: 0.3s; }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Button hover effects */
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.1);
        }

        /* Feature card hover effects */
        .bg-gray-800:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        /* Icon hover animation */
        .bg-gray-800:hover i {
          transform: scale(1.1);
          color: #fbbf24;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .min-h-\\[600px\\] {
            min-height: 400px;
          }

          .text-6xl {
            font-size: 3rem;
          }
        }

        @media (max-width: 768px) {
          .min-h-\\[600px\\] {
            min-height: 300px;
          }

          .text-5xl {
            font-size: 2.5rem;
          }

          .lg\\:w-3\\/5 {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default WhyChooseUsSection;
