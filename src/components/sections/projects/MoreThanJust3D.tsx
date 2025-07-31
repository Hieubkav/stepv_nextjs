'use client';

import React from 'react';

const MoreThanJust3D = () => {
  // Client/Partner brands - sử dụng text-based logos
  const clientBrands = [
    { name: 'LUXURY COSMETICS', category: 'Beauty' },
    { name: 'PREMIUM FRAGRANCE', category: 'Perfume' },
    { name: 'SKINCARE ELITE', category: 'Skincare' },
    { name: 'FASHION HOUSE', category: 'Fashion' },
    { name: 'JEWELRY COLLECTION', category: 'Jewelry' },
    { name: 'WELLNESS BRAND', category: 'Health' },
    { name: 'TECH INNOVATION', category: 'Technology' },
    { name: 'AUTOMOTIVE DESIGN', category: 'Automotive' },
    { name: 'LIFESTYLE BRAND', category: 'Lifestyle' },
    { name: 'FOOD & BEVERAGE', category: 'F&B' },
  ];

  return (
    <section className="bg-black text-white py-20 lg:py-32">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Cột trái - Nội dung */}
          <div className="space-y-8">
            <h2 className="text-5xl lg:text-6xl font-light uppercase tracking-wider leading-tight">
              NHIỀU HƠN CHỈ LÀ
              <br />
              <span className="text-yellow-400">HÌNH ẢNH 3D</span>
            </h2>
            
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p>
                Chúng tôi không chỉ tạo ra những hình ảnh 3D đẹp mắt. Chúng tôi xây dựng những trải nghiệm thị giác 
                hoàn chỉnh giúp thương hiệu của bạn kết nối sâu sắc với khách hàng.
              </p>
              
              <p>
                Từ concept ban đầu đến sản phẩm cuối cùng, chúng tôi đồng hành cùng bạn trong mọi bước của quá trình 
                sáng tạo. Với kinh nghiệm làm việc cùng các thương hiệu hàng đầu, chúng tôi hiểu rõ cách biến ý tưởng 
                thành hiện thực.
              </p>
              
              <p>
                <strong className="text-white">Triết lý của chúng tôi:</strong> Mỗi dự án là một câu chuyện độc đáo, 
                và chúng tôi cam kết kể câu chuyện đó một cách ấn tượng nhất.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">150+</div>
                <div className="text-sm uppercase tracking-wider text-gray-400">Dự án hoàn thành</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">50+</div>
                <div className="text-sm uppercase tracking-wider text-gray-400">Thương hiệu tin tưởng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">5+</div>
                <div className="text-sm uppercase tracking-wider text-gray-400">Năm kinh nghiệm</div>
              </div>
            </div>
          </div>

          {/* Cột phải - Client Logos Slider */}
          <div className="space-y-8">
            <h3 className="text-2xl uppercase tracking-wider text-center lg:text-left">
              Được Tin Tưởng Bởi Các Thương Hiệu Hàng Đầu
            </h3>
            
            {/* Infinite Scrolling Brand Names */}
            <div className="overflow-hidden">
              <div className="animate-scroll-vertical space-y-4">
                {/* First set */}
                {clientBrands.map((brand, index) => (
                  <div
                    key={`first-${index}`}
                    className="flex flex-col items-center justify-center h-20 px-4 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 transition-colors duration-300 border border-white/10"
                  >
                    <div className="text-white font-bold text-sm uppercase tracking-wider text-center">
                      {brand.name}
                    </div>
                    <div className="text-yellow-400 text-xs uppercase tracking-wider mt-1">
                      {brand.category}
                    </div>
                  </div>
                ))}

                {/* Duplicate set for seamless loop */}
                {clientBrands.map((brand, index) => (
                  <div
                    key={`second-${index}`}
                    className="flex flex-col items-center justify-center h-20 px-4 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 transition-colors duration-300 border border-white/10"
                  >
                    <div className="text-white font-bold text-sm uppercase tracking-wider text-center">
                      {brand.name}
                    </div>
                    <div className="text-yellow-400 text-xs uppercase tracking-wider mt-1">
                      {brand.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20 lg:mt-32">
          <div className="max-w-3xl mx-auto space-y-8">
            <h3 className="text-3xl lg:text-4xl font-light uppercase tracking-wider">
              Sẵn Sàng Tạo Ra Điều Gì Đó Tuyệt Vời?
            </h3>
            <p className="text-xl text-gray-300">
              Hãy để chúng tôi giúp bạn biến ý tưởng thành những trải nghiệm thị giác đáng nhớ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-400 text-black px-8 py-4 uppercase font-semibold tracking-wider hover:bg-yellow-300 transition-all duration-300 hover:scale-105">
                BẮT ĐẦU DỰ ÁN CỦA BẠN
              </button>
              <button className="border-2 border-white text-white px-8 py-4 uppercase font-semibold tracking-wider hover:bg-white hover:text-black transition-all duration-300">
                XEM QUY TRÌNH CỦA CHÚNG TÔI
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoreThanJust3D;
