'use client';

import { useState } from 'react';

interface AccordionItem {
  title: string;
  content: string;
}

interface Card {
  icon: string;
  title: string;
  items: AccordionItem[];
}

interface Why3DVisualsSectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

const Why3DVisualsSection = ({
  title = 'TẠI SAO HÌNH ẢNH 3D LÀ LỰA CHỌN THÔNG MINH CHO THƯƠNG HIỆU CỦA BẠN',
  subtitle = '',
  buttonText = 'LIÊN HỆ CHÚNG TÔI',
  buttonLink = '#contact'
}: Why3DVisualsSectionProps) => {
  const [openAccordions, setOpenAccordions] = useState<{[key: string]: number | null}>({});

  const toggleAccordion = (cardIndex: number, itemIndex: number) => {
    const key = `card-${cardIndex}`;
    setOpenAccordions(prev => ({
      ...prev,
      [key]: prev[key] === itemIndex ? null : itemIndex
    }));
  };

  const topCards: Card[] = [
    {
      icon: 'fas fa-dollar-sign',
      title: 'HIỆU QUẢ CHI PHÍ',
      items: [
        {
          title: 'Tiết Kiệm Chi Phí Sản Xuất',
          content: 'Không cần chụp ảnh đắt tiền, tạo mẫu thử hay thiết lập vật lý—hình ảnh 3D của chúng tôi mang lại kết quả cao cấp với chi phí chỉ bằng một phần nhỏ.'
        },
        {
          title: 'Tài Sản Có Thể Tái Sử Dụng',
          content: 'Hình ảnh 3D của bạn có thể được sử dụng lại cho nhiều chiến dịch, tiết kiệm thời gian và tiền bạc cho các dự án tương lai.'
        },
        {
          title: 'Tính Bền Vững',
          content: 'Giảm lãng phí và tác động môi trường bằng cách loại bỏ nhu cầu sử dụng vật liệu vật lý.'
        }
      ]
    },
    {
      icon: 'fas fa-video',
      title: 'CHẤT LƯỢNG STUDIO ĐIỆN ẢNH',
      items: [
        {
          title: 'Hoàn Hảo Siêu Thực',
          content: 'Công nghệ kết xuất tiên tiến tạo ra hình ảnh không thể phân biệt với nhiếp ảnh thực tế.'
        },
        {
          title: 'Tự Do Sáng Tạo Vô Hạn',
          content: 'Không bị giới hạn bởi vật lý—tạo ra những góc nhìn, hiệu ứng ánh sáng và môi trường không thể thực hiện trong thực tế.'
        },
        {
          title: 'Tính Linh Hoạt Trên Nhiều Nền Tảng',
          content: 'Tối ưu hóa cho web, in ấn, video và thực tế ảo từ cùng một tài sản 3D.'
        }
      ]
    },
    {
      icon: 'fas fa-clock',
      title: 'TỐC ĐỘ VÀ LINH HOẠT',
      items: [
        {
          title: 'Thời Gian Ra Thị Trường Nhanh Hơn',
          content: 'Bỏ qua các khâu logistics phức tạp của chụp ảnh truyền thống và nhận được hình ảnh hoàn thiện trong vài ngày.'
        },
        {
          title: 'Chỉnh Sửa Dễ Dàng',
          content: 'Thực hiện thay đổi nhanh chóng đối với màu sắc, vật liệu hoặc thiết kế mà không cần chụp lại.'
        }
      ]
    }
  ];

  const bottomCards: Card[] = [
    {
      icon: 'fas fa-gem',
      title: 'ĐƯỢC THIẾT KẾ CHO HÀNG CAO CẤP',
      items: [
        {
          title: 'Tập Trung Độc Quyền Vào Nước Hoa & Làm Đẹp',
          content: 'Mỗi dự án được thiết kế để phản ánh sự tinh tế và thanh lịch của thương hiệu bạn.'
        },
        {
          title: 'Quy Trình Hợp Tác',
          content: 'Làm việc chặt chẽ với đội ngũ của chúng tôi để đảm bảo tầm nhìn của bạn được hiện thực hóa chính xác như bạn tưởng tượng.'
        }
      ]
    },
    {
      icon: 'fas fa-lightbulb',
      title: 'GIẢI PHÁP HƯỚNG TƯƠNG LAI',
      items: [
        {
          title: 'Tài Sản Có Thể Mở Rộng',
          content: 'Hình ảnh 3D phát triển cùng thương hiệu của bạn, cho phép cập nhật và điều chỉnh khi dòng sản phẩm của bạn phát triển.'
        },
        {
          title: 'Công Nghệ Tiên Tiến',
          content: 'Luôn dẫn đầu xu hướng với hình ảnh được tạo bằng các kỹ thuật kết xuất 3D mới nhất.'
        }
      ]
    }
  ];

  return (
    <section className="bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light uppercase text-white leading-tight mb-8">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl font-light leading-relaxed text-gray-300 lg:w-3/5 mb-8">
              {subtitle}
            </p>
          )}
          <a 
            href={buttonLink}
            className="inline-flex items-center gap-3 px-8 py-3 border border-white rounded-2xl text-white text-sm uppercase font-medium hover:bg-white hover:text-black transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {buttonText}
          </a>
        </div>

        {/* Top Cards - 3 columns */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-8">
          {topCards.map((card, cardIndex) => (
            <div 
              key={cardIndex}
              className="flex w-full flex-col gap-5 rounded-3xl border border-gray-800 bg-gradient-to-b from-black to-gray-900 p-6 transition-transform duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-5">
                <i className={`${card.icon} text-3xl text-yellow-400`}></i>
                <h3 className="text-2xl font-semibold uppercase text-white">{card.title}</h3>
              </div>

              <div className="flex flex-col">
                {card.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-t border-white/20 first:border-t-0">
                    <div 
                      onClick={() => toggleAccordion(cardIndex, itemIndex)}
                      className="flex cursor-pointer items-center justify-between py-4"
                    >
                      <div className="flex items-center gap-3">
                        <i className="fas fa-chevron-right text-yellow-400 text-sm"></i>
                        <span 
                          className={`text-lg font-light text-white transition-colors duration-300 ${
                            openAccordions[`card-${cardIndex}`] === itemIndex ? '!text-yellow-400' : ''
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <span 
                        className={`text-lg text-white transition-colors duration-300 ${
                          openAccordions[`card-${cardIndex}`] === itemIndex ? '!text-yellow-400' : ''
                        }`}
                      >
                        {openAccordions[`card-${cardIndex}`] === itemIndex ? '−' : '+'}
                      </span>
                    </div>
                    
                    {openAccordions[`card-${cardIndex}`] === itemIndex && (
                      <div className="pb-4 text-gray-300 leading-relaxed animate-fade-in">
                        {item.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Cards - 2 columns */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {bottomCards.map((card, cardIndex) => {
            const adjustedCardIndex = cardIndex + topCards.length; // Để tránh conflict với top cards
            return (
              <div 
                key={adjustedCardIndex}
                className="flex w-full flex-col gap-5 rounded-3xl border border-gray-800 bg-gradient-to-b from-black to-gray-900 p-6 transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-5">
                  <i className={`${card.icon} text-3xl text-yellow-400`}></i>
                  <h3 className="text-2xl font-semibold uppercase text-white">{card.title}</h3>
                </div>

                <div className="flex flex-col">
                  {card.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-t border-white/20 first:border-t-0">
                      <div 
                        onClick={() => toggleAccordion(adjustedCardIndex, itemIndex)}
                        className="flex cursor-pointer items-center justify-between py-4"
                      >
                        <div className="flex items-center gap-3">
                          <i className="fas fa-chevron-right text-yellow-400 text-sm"></i>
                          <span 
                            className={`text-lg font-light text-white transition-colors duration-300 ${
                              openAccordions[`card-${adjustedCardIndex}`] === itemIndex ? '!text-yellow-400' : ''
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                        <span 
                          className={`text-lg text-white transition-colors duration-300 ${
                            openAccordions[`card-${adjustedCardIndex}`] === itemIndex ? '!text-yellow-400' : ''
                          }`}
                        >
                          {openAccordions[`card-${adjustedCardIndex}`] === itemIndex ? '−' : '+'}
                        </span>
                      </div>
                      
                      {openAccordions[`card-${adjustedCardIndex}`] === itemIndex && (
                        <div className="pb-4 text-gray-300 leading-relaxed animate-fade-in">
                          {item.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom styles removed to fix parsing issues */}
    </section>
  );
};

export default Why3DVisualsSection;
