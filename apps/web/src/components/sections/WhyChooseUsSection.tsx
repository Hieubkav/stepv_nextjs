'use client';

import React from 'react';

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
  // Không cần state cho video playing vì video sẽ tự động phát như background

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
          {/* Left Video Background Card */}
          <div className="relative w-full">
            {/* Lớp Cơ sở (Container chính) - Khối hình chữ nhật bo góc với ảnh nền */}
            <div
              className="relative overflow-hidden min-h-[600px] bg-cover bg-center bg-no-repeat"
              style={{
                borderRadius: '25px',
                backgroundImage: `url(${videoPlaceholder})`,
                width: '100%'
              }}
            >
              {/* Lớp Phủ Video (Overlay) - Phủ chính xác lên toàn bộ container */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  borderRadius: '25px'
                }}
              >
                {/* Lớp Video (YouTube Embed) - Video được căn giữa và lấp đầy */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="relative"
                    style={{
                      width: '120%',
                      height: '120%',
                      transform: 'translate(-50%, -50%)',
                      position: 'absolute',
                      top: '50%',
                      left: '50%'
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?controls=0&rel=0&playsinline=1&autoplay=1&mute=1&loop=1&playlist=${videoId}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      title="Background Video"
                      className="w-full h-full object-cover"
                      style={{
                        pointerEvents: 'none'
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              {/* Lớp nội dung có thể tương tác (nếu cần) */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-end pointer-events-auto">
                {/* Có thể thêm nội dung text hoặc button ở đây */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">CHUYÊN MÔN 3D CAO CẤP</h3>
                  <p className="text-sm opacity-90">Khám phá quy trình sản xuất video 3D chuyên nghiệp của chúng tôi</p>
                </div>
              </div>
            </div>
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

      {/* Custom styles removed to fix parsing issues */}
    </section>
  );
};

export default WhyChooseUsSection;
