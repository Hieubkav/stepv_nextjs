'use client';

import { useState } from 'react';

interface WorkStep {
  title: string;
  description: string;
  icon: string;
}

interface WeWorkSectionProps {
  title?: string;
  subtitle?: string;
  steps?: WorkStep[];
}

const WeWorkSection = ({
  title = 'CÁCH CHÚNG TÔI LÀM VIỆC',
  subtitle = 'Tại Step V Studio, chúng tôi tin rằng kết quả tuyệt vời đến từ quy trình làm việc có cấu trúc và minh bạch. Đó là lý do tại sao chúng tôi đã thiết kế một quy trình giúp bạn luôn được thông tin và tham gia vào từng bước.',
  steps = [
    {
      title: 'KHỞI ĐỘNG & LÊN KẾ HOẠCH',
      description: 'Chúng tôi bắt đầu với buổi tư vấn miễn phí để hiểu rõ tầm nhìn, mục tiêu và yêu cầu của bạn. Mỗi dự án đều bắt đầu với lộ trình rõ ràng được thiết kế riêng cho nhu cầu của bạn',
      icon: 'fa-lightbulb'
    },
    {
      title: 'PHÁT TRIỂN Ý TƯỞNG',
      description: 'Đội ngũ sáng tạo của chúng tôi phát triển các ý tưởng đổi mới và trình bày những ý tưởng ban đầu phù hợp với tầm nhìn thương hiệu và mục tiêu dự án của bạn',
      icon: 'fa-pencil-ruler'
    },
    {
      title: 'MÔ HÌNH HÓA & THIẾT KẾ',
      description: 'Sử dụng các công cụ tiên tiến, chúng tôi tạo ra các mô hình 3D chi tiết, kết cấu và thiết lập ánh sáng để biến ý tưởng của bạn thành hiện thực',
      icon: 'fa-cube'
    },
    {
      title: 'HOẠT HÌNH & HIỆU ỨNG',
      description: 'Chúng tôi thêm hoạt hình động, hiệu ứng hình ảnh và đồ họa chuyển động để tạo ra nội dung hấp dẫn và cuốn hút',
      icon: 'fa-play-circle'
    },
    {
      title: 'ĐÁNH GIÁ & HOÀN THIỆN',
      description: 'Chúng tôi làm việc chặt chẽ với bạn để đánh giá tiến độ, thu thập phản hồi và thực hiện các điều chỉnh cần thiết để đảm bảo sự hoàn hảo',
      icon: 'fa-search'
    },
    {
      title: 'BÀN GIAO CUỐI CÙNG',
      description: 'Sản phẩm cuối cùng chất lượng cao được bàn giao theo định dạng bạn yêu cầu, sẵn sàng sử dụng trên tất cả các kênh marketing của bạn',
      icon: 'fa-check-circle'
    }
  ]
}: WeWorkSectionProps) => {
  const [activeStep, setActiveStep] = useState(0);

  // Calculate positions for step buttons around the circle
  const getStepPosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90; // Start from top
    const radius = 250; // Distance from center in pixels
    const centerX = 250; // Center X of the 500px circle
    const centerY = 250; // Center Y of the 500px circle
    const x = centerX + radius * Math.cos((angle * Math.PI) / 180) - 55; // -55 to center the 110px button
    const y = centerY + radius * Math.sin((angle * Math.PI) / 180) - 55; // -55 to center the 110px button
    return { x, y };
  };

  return (
    <section className="py-20 bg-black text-white min-h-screen">
      <div className="container mx-auto px-4 max-w-[1140px]">
        {/* Grid Layout: Content + Circle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* COL 1: CONTENT - Order 2 on mobile, 1 on desktop */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <h2 className="text-[61px] font-light mb-8 text-white uppercase tracking-wide">
              {title}
            </h2>
            <p className="text-[20px] font-light text-white leading-relaxed mb-12">
              {subtitle}
            </p>
            <a
              href="#contact"
              className="inline-block px-8 py-4 border-2 border-[#FFD700] text-[#FFD700] uppercase font-medium rounded-lg hover:bg-[#FFD700] hover:text-black transition-all duration-300"
            >
              Bắt đầu dự án của bạn ngay hôm nay
            </a>
          </div>

          {/* COL 2: CIRCLE WORKFLOW - Order 1 on mobile, 2 on desktop */}
          <div className="order-1 lg:order-2">
            <div className="relative w-full max-w-lg mx-auto" style={{ width: '500px', height: '500px' }}>
            {/* Main Center Circle */}
            <div className="absolute inset-0 w-[500px] h-[500px] rounded-full border-2 border-[#FFD700] bg-black flex flex-col justify-center items-center text-center p-12">
              {/* Active Step Content */}
              <div className="mb-6 text-[#FFD700] text-5xl">
                <i className={`fa ${steps[activeStep]?.icon || 'fa-star'}`}></i>
              </div>
              <h3 className="text-[#FFD700] text-2xl uppercase font-medium mb-6 leading-tight">
                {steps[activeStep]?.title || 'Step Title'}
              </h3>
              <p className="text-white font-light text-base leading-relaxed">
                {steps[activeStep]?.description || 'Step description'}
              </p>
            </div>

            {/* Step Buttons Around Circle */}
            {steps.map((step, index) => {
              const position = getStepPosition(index, steps.length);
              return (
                <button
                  key={index}
                  className={`absolute w-[110px] h-[110px] rounded-full border-2 border-[#FFD700] bg-black flex items-center justify-center text-white font-medium transition-all duration-300 hover:bg-[#FFD700] hover:text-black ${
                    activeStep === index ? 'bg-[#FFD700] text-black' : ''
                  }`}
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`
                  }}
                  onClick={() => setActiveStep(index)}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                >
                  Step {index + 1}
                </button>
              );
            })}

            {/* Hidden Content for Other Steps */}
            {steps.map((step, index) => (
              index !== activeStep && (
                <div
                  key={`hidden-${index}`}
                  className="absolute inset-0 opacity-0 invisible"
                  style={{ transition: 'opacity 0.3s ease, visibility 0.3s ease' }}
                >
                  <div className="w-full h-full flex flex-col justify-center items-center text-center p-12">
                    <div className="mb-6 text-[#FFD700] text-5xl">
                      <i className={`fa ${step.icon}`}></i>
                    </div>
                    <h3 className="text-[#FFD700] text-2xl uppercase font-medium mb-6 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-white font-light text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* FontAwesome Icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      {/* Custom Styles */}
      <style jsx>{`
        /* Smooth transitions for interactive elements */
        button {
          transition: all 0.3s ease;
        }
        
        button:hover {
          transform: scale(1.05);
        }

        /* Ensure proper font rendering */
        h2, h3 {
          font-family: inherit;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          h2 {
            font-size: 3rem !important;
            text-align: center;
          }

          .order-2 {
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }

          h2 {
            font-size: 2.5rem !important;
          }

          .relative {
            transform: scale(0.7);
            margin: -75px 0;
          }
        }

        @media (max-width: 480px) {
          .relative {
            transform: scale(0.5);
            margin: -125px 0;
          }
        }
      `}</style>
    </section>
  );
};

export default WeWorkSection;