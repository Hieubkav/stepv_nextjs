'use client';

import React from 'react';
import Image from 'next/image';

const ServicesShowcase = () => {
  const services = [
    {
      id: 1,
      title: 'TRỰC QUAN HÓA SẢN PHẨM 3D',
      description: 'Biến đổi sản phẩm của bạn thành những hình ảnh 3D siêu thực tuyệt đẹp, thu hút khán giả và thúc đẩy doanh số. Kỹ thuật render tiên tiến của chúng tôi làm sống động từng chi tiết.',
      image: '/images/projects/GDIVINE2.png',
      imagePosition: 'right',
      background: 'dark',
      imageWidth: '55%',
      textWidth: '45%'
    },
    {
      id: 2,
      title: 'HOẠT HÌNH SẢN PHẨM 3D',
      description: 'Thổi hồn vào sản phẩm của bạn với những hoạt hình 3D động kể câu chuyện thương hiệu. Từ chuyển động mượt mà đến tương tác phức tạp, chúng tôi tạo ra hoạt hình thu hút và chuyển đổi.',
      image: '/images/projects/2321.png',
      imagePosition: 'left',
      background: 'light',
      imageWidth: '55%',
      textWidth: '45%'
    },
    {
      id: 3,
      title: 'SẢN XUẤT QUẢNG CÁO TRUYỀN HÌNH',
      description: 'Dịch vụ sản xuất quảng cáo toàn diện kết hợp hình ảnh tuyệt đẹp với cách kể chuyện hấp dẫn. Từ ý tưởng đến sản phẩm cuối cùng, chúng tôi tạo ra những quảng cáo tạo ấn tượng.',
      image: '/images/projects/vlcsnap-2024-08-24-21h22m22s456.png',
      imagePosition: 'right',
      background: 'dark',
      imageWidth: '59%',
      textWidth: '41%'
    },
    {
      id: 4,
      title: 'SẢN XUẤT NHẠC & LỒNG TIẾNG',
      description: 'Dịch vụ sản xuất âm thanh hoàn chỉnh bao gồm sáng tác nhạc gốc, thiết kế âm thanh và lồng tiếng chuyên nghiệp để bổ sung hoàn hảo cho nội dung hình ảnh của bạn.',
      image: '/images/projects/GDIVINE2.png',
      imagePosition: 'left',
      background: 'dark',
      imageWidth: '45%',
      textWidth: '55%'
    }
  ];

  return (
    <section className="relative">
      {services.map((service) => (
        <div
          key={service.id}
          className={`min-h-screen flex items-center ${
            service.background === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-0 items-center min-h-screen">
              {/* Conditional rendering based on image position */}
              {service.imagePosition === 'left' ? (
                <>
                  {/* Image Left */}
                  <div
                    className="lg:col-span-7 relative h-[60vh] lg:h-[80vh]"
                  >
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Text Right */}
                  <div
                    className="lg:col-span-5 lg:pl-16 py-16 lg:py-0"
                  >
                    <div className="max-w-lg">
                      <h2 className="text-4xl lg:text-5xl font-light uppercase tracking-wider mb-8 leading-tight">
                        {service.title}
                      </h2>
                      <p className={`text-lg leading-relaxed mb-8 ${
                        service.background === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {service.description}
                      </p>
                      <button className={`px-8 py-4 uppercase font-semibold tracking-wider transition-all duration-300 hover:scale-105 ${
                        service.background === 'dark' 
                          ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}>
                        LIÊN HỆ CHÚNG TÔI
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Text Left */}
                  <div
                    className="lg:col-span-5 lg:pr-16 py-16 lg:py-0"
                  >
                    <div className="max-w-lg ml-auto">
                      <h2 className="text-4xl lg:text-5xl font-light uppercase tracking-wider mb-8 leading-tight">
                        {service.title}
                      </h2>
                      <p className={`text-lg leading-relaxed mb-8 ${
                        service.background === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {service.description}
                      </p>
                      <button className={`px-8 py-4 uppercase font-semibold tracking-wider transition-all duration-300 hover:scale-105 ${
                        service.background === 'dark' 
                          ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}>
                        LIÊN HỆ CHÚNG TÔI
                      </button>
                    </div>
                  </div>
                  
                  {/* Image Right */}
                  <div
                    className="lg:col-span-7 relative h-[60vh] lg:h-[80vh]"
                  >
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default ServicesShowcase;
