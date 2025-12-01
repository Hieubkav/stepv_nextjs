'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getLucideIcon } from '@/lib/lucide-icons';

interface ServiceItem {
  image: string;
  title: string;
  desc: string;
  icon: string;
  linkUrl?: string;
}

interface ServicesSectionProps {
  title?: string;
  subtitle?: string;
  services?: ServiceItem[];
  backgroundColor?: string;
}

const ServicesSection = ({
  title = 'DỊCH VỤ DỰNG HÌNH 3D CHUYÊN NGHIỆP - RENDER SIÊU THỰC',
  subtitle = 'DOHY MEDIA chuyên cung cấp dịch vụ dựng hình 3D chuyên nghiệp và render kiến trúc siêu thực. Từ studio làm hoạt hình 3D đến dựng mô phỏng sản phẩm 3D quảng cáo, chúng tôi hiện thực hóa mọi ý tưởng của bạn với chất lượng vượt trội.',
  services = [
    {
      image: 'https://stepv.studio/wp-content/uploads/2025/03/jomalonewithouttext-min-819x1024.png',
      title: 'LÀM PHIM HOẠT HÌNH 3D CHUYÊN NGHIỆP',
      desc: 'Studio làm hoạt hình 3D chuyên nghiệp với đội ngũ chuyên gia giàu kinh nghiệm. Chúng tôi cung cấp dịch vụ dựng phim hoạt hình 3D từ lên ý tưởng, kịch bản đến sản xuất hoàn chỉnh. Với kỹ thuật animation tiên tiến, tạo ra những bộ phim hoạt hình 3D ấn tượng, hấp dẫn và độc đáo.',
      icon: 'Film',
      linkUrl: '/projects'
    },
    {
      image: 'https://stepv.studio/wp-content/uploads/2025/03/BOIS-1-1024x576.png',
      title: 'DỰNG MÔ HÌNH 3D THEO YÊU CẦU',
      desc: 'Chuyên dựng mô phỏng sản phẩm 3D quảng cáo và làm mô hình 3D theo yêu cầu. Dịch vụ render nhanh 3D của chúng tôi giúp bạn tạo ra hình ảnh sống động, chân thực nhất. Đặc biệt hữu ích cho dựng nhà chung cư bằng 3D và các dự án kiến trúc phức tạp.',
      icon: 'Cube',
      linkUrl: '/projects'
    },
    {
      image: 'https://stepv.studio/wp-content/uploads/2025/03/BOIS-VFX-2-576x1024.png',
      title: 'THƯ VIỆN VFX - RENDER KIẾN TRÚC SIÊU THỰC',
      desc: 'Cung cấp Thư viện VFX chuyên nghiệp và dịch vụ render kiến trúc siêu thực với công nghệ photorealistic đỉnh cao. Đội ngũ VFX chuyên nghiệp biến mọi cảnh quay trở nên siêu thực. Hiện thực hóa dựng 3D siêu thực – photorealistic với chất lượng hình ảnh tuyệt vời.',
      icon: 'Sparkles',
      linkUrl: '/projects'
    },
    {
      image: 'https://stepv.studio/wp-content/uploads/2025/01/2321-680x1024.png',
      title: 'LÀM 3D MARKETING CHO DOANH NGHIỆP',
      desc: 'Chuyên làm video 3D quảng cáo và thiết kế 3D sản phẩm mỹ phẩm chuyên nghiệp. Dịch vụ làm 3D marketing cho doanh nghiệp giúp nâng cao hiệu quả chiến dịch quảng cáo. Tạo ra hình ảnh 3D sản phẩm mỹ phẩm độc đáo, thu hút khách hàng tối đa.',
      icon: 'Megaphone',
      linkUrl: '/projects'
    },
    {
      image: 'https://stepv.studio/wp-content/uploads/2024/08/vlcsnap-2024-08-24-20h27m01s097-576x1024.png',
      title: 'THIẾT KẾ KIẾN TRÚC 3D & NỘI THẤT',
      desc: 'Chuyên thiết kế kiến trúc 3D, dựng nội thất 3D giá rẻ và thiết kế 3D ngoại thất chuyên nghiệp. Dịch vụ dựng phối cảnh kiến trúc giúp bạn hình dung không gian sống một cách chân thực nhất. Làm hình ảnh 3D chuyên nghiệp cho mọi dự án kiến trúc.',
      icon: 'Code',
      linkUrl: '/projects'
    },
    {
      image: 'https://stepv.studio/wp-content/uploads/2025/01/pexels-pixabay-164938-1024x620.jpg',
      title: 'KHÓA HỌC ĐỒ HỌA 3D CHUYÊN NGHIỆP',
      desc: 'Cung cấp khóa học đồ họa 3D từ cơ bản đến nâng cao. đào tạo chuyên sâu về dựng hình 3D, render, và animation. Học cách làm hình ảnh 3D chuyên nghiệp từ đội ngũ chuyên gia kinh nghiệm. Đào tạo thực chiến cho ngành 3D marketing và quảng cáo.',
      icon: 'Bot',
      linkUrl: '/khoa-hoc'
    }
  ],
  backgroundColor = 'bg-black'
}: ServicesSectionProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Grid layout for 6 services (3x2)
  const getGridCols = () => {
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  const handleServiceClick = (linkUrl?: string) => {
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };

  return (
    <section id="services" className={`py-20 ${backgroundColor} text-white`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div className={`grid ${getGridCols()} gap-8 max-w-7xl mx-auto`}>
          {services.map((service, index) => {
            const ServiceIcon = getLucideIcon(service.icon);
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleServiceClick(service.linkUrl)}
              >
                <div className="relative min-h-[500px] md:min-h-[600px]">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/60"></div>

                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-black/20 transition-opacity duration-500 ${
                      hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}></div>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                    {/* Icon */}
                    <div className="flex justify-start">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <ServiceIcon className="text-2xl text-yellow-400 drop-shadow-lg" />
                      </div>
                    </div>

                    {/* Bottom Content */}
                    <div>
                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
                        {service.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-6 line-clamp-4">
                        {service.desc}
                      </p>

                      {/* Learn More Button */}
                      <button className="border border-white text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wider">
                        LEARN MORE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Smooth hover animations */
        .group {
          will-change: transform;
        }

        /* Card hover effects */
        .group:hover {
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }

        /* Image zoom effect */
        .group:hover img {
          filter: brightness(1.1) contrast(1.05);
        }

        /* Text clamp for description */
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .min-h-[600px] {
            min-height: 450px;
          }

          .min-h-[500px] {
            min-height: 400px;
          }

          .text-2xl {
            font-size: 1.5rem;
          }

          .line-clamp-4 {
            -webkit-line-clamp: 3;
          }
        }

        /* Grid responsive */
        @media (max-width: 640px) {
          .grid {
            gap: 1.5rem;
          }

          .min-h-[600px] {
            min-height: 350px;
          }

          .min-h-[500px] {
            min-height: 320px;
          }
        }

        /* Icon hover animation */
        .group:hover .w-8 span {
          transform: scale(1.2);
          color: #fbbf24;
          filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.5));
        }

        /* Button animation */
        .group button:hover {
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
};

export default ServicesSection;
