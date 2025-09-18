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
  title = 'GIỚI THIỆU VỀ DỊCH VỤ LÀM PHIM 3D',
  subtitle = 'Tại DOHY MEDIA, Dù bạn cần làm phim hoạt hình, mô phỏng 3D cho sản phẩm, hoặc những hiệu ứng hình ảnh (VFX) tuyệt vời, chúng tôi luôn sẵn sàng hỗ trợ để hiện thực hóa ý tưởng của bạn.',
  services = [
    {
      image: 'https://stepv.studio/wp-content/uploads/2025/03/jomalonewithouttext-min-819x1024.png',
      title: 'SẢN XUẤT PHIM HOẠT HÌNH 2D/3D',
      desc: 'Chúng tôi chuyên làm phim hoạt hình 3D từ khâu lên ý tưởng, kịch bản, thiết kế đến những cảnh chuyển sáng tạo và hấp dẫn qua từng thước hình. Với kỹ thuật animation tinh xảo, chúng tôi giúp bạn kể những câu chuyện đặc biệt theo cách sinh động và độc đáo nhất.',
      icon: 'Film',
      linkUrl: '/projects'
    },
    {
      image: 'https://stepv.studio/wp-content/uploads/2025/03/BOIS-1-1024x576.png',
      title: 'MÔ PHỎNG 3D VÀ ANIMATION',
      desc: 'Dịch vụ mô phỏng 3D cho phép bạn tạo ra những hình ảnh sống động và chân thực, thể hiện mô phỏng cơ khí, nội thất, hoặc các vật thể phức tạp. Đặc biệt hữu ích đối với doanh nghiệp muốn giới thiệu sản phẩm cuối cùng. Chúng tôi cung cấp animation 3D cho các dự án quảng cáo hoặc giới thiệu sản phẩm.',
      icon: 'Cube',
      linkUrl: '/projects'
    },
    {
      image: 'https://stepv.studio/wp-content/uploads/2025/03/BOIS-VFX-2-576x1024.png',
      title: 'HIỆU ỨNG HÌNH ẢNH VFX',
      desc: 'Chúng tôi cung cấp các hiệu ứng hình ảnh (VFX) cao cấp cho các bộ phim hoặc quảng cáo, giúp nâng cao chất lượng hình ảnh và tạo ra những cảnh quay ấn tượng. Đội lá chuyên nghiệp, biến hóa hay cảnh quay siêu thực, đội ngũ VFX của chúng tôi luôn mang đến kết quả tuyệt vời.',
      icon: 'Sparkles',
      linkUrl: '/projects'
    },
    {
      image: 'https://stepv.studio/wp-content/uploads/2025/01/2321-680x1024.png',
      title: 'MARKETING 3D SÁNG TẠO: MÔ HÌNH 3D SỰ KIỆN',
      desc: 'Dịch vụ Marketing 3D sáng tạo kết hợp mô hình 3D với các chiến lược quảng cáo, phương pháp tiếp cận hoàn toàn mới mẻ và hấp dẫn cho các chiến dịch marketing. Thay vì chỉ sử dụng hình ảnh thông thường, bạn có thể sử dụng mô hình 3D để mô phỏng sức mạnh và sự tương tác với khách hàng, giúp bạn tạo ra tính thú vị quan và cảm giác sống động cho người xem.',
      icon: 'Megaphone',
      linkUrl: '/projects'
    },
    {
      image: 'https://stepv.studio/wp-content/uploads/2024/08/vlcsnap-2024-08-24-20h27m01s097-576x1024.png',
      title: 'THIẾT KẾ WEB 2D/3D',
      desc: 'Dịch vụ thiết kế web 2D/3D giúp bạn có một website độc đáo và sáng tạo, mang lại trải nghiệm người dùng tuyệt vời. Chúng tôi tạo ra các website trong tác, với thiết kế 2D hoặc 3D theo yêu cầu, tùy chỉnh và tối ưu hóa SEO. Đảm bảo website của bạn không chỉ đẹp mà còn dễ dàng sử dụng, giúp khách hàng dễ dàng tiếp cận và chuyển đổi.',
      icon: 'Code',
      linkUrl: '/projects'
    },
    {
      image: 'https://stepv.studio/wp-content/uploads/2025/01/pexels-pixabay-164938-1024x620.jpg',
      title: 'VIDEO MARKETING AI',
      desc: 'Chúng tôi cung cấp dịch vụ video marketing AI, giúp tạo ra các video quảng cáo tự động với nội dung được cá nhân hóa trên dữ liệu về phân tích thị trường. Sử dụng công nghệ AI, chúng tôi có thể tối ưu hóa video của bạn để phù hợp với từng đối tượng khách hàng, tạo ra các video quảng cáo hiệu quả hơn và dễ dàng thu hút người xem.',
      icon: 'Bot',
      linkUrl: '/projects'
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
