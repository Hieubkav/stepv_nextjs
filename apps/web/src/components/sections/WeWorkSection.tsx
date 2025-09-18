'use client';

import { useState, useEffect } from 'react';
import { getLucideIcon } from '@/lib/lucide-icons';

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
      icon: 'Lightbulb'
    },
    {
      title: 'PHÁT TRIỂN Ý TƯỞNG',
      description: 'Đội ngũ sáng tạo của chúng tôi phát triển các ý tưởng đổi mới và trình bày những ý tưởng ban đầu phù hợp với tầm nhìn thương hiệu và mục tiêu dự án của bạn',
      icon: 'PenTool'
    },
    {
      title: 'MÔ HÌNH HÓA & THIẾT KẾ',
      description: 'Sử dụng các công cụ tiên tiến, chúng tôi tạo ra các mô hình 3D chi tiết, kết cấu và thiết lập ánh sáng để biến ý tưởng của bạn thành hiện thực',
      icon: 'Cube'
    },
    {
      title: 'HOẠT HÌNH & HIỆU ỨNG',
      description: 'Chúng tôi thêm hoạt hình động, hiệu ứng hình ảnh và đồ họa chuyển động để tạo ra nội dung hấp dẫn và cuốn hút',
      icon: 'PlayCircle'
    },
    {
      title: 'ĐÁNH GIÁ & HOÀN THIỆN',
      description: 'Chúng tôi làm việc chặt chẽ với bạn để đánh giá tiến độ, thu thập phản hồi và thực hiện các điều chỉnh cần thiết để đảm bảo sự hoàn hảo',
      icon: 'Search'
    },
    {
      title: 'BÀN GIAO CUỐI CÙNG',
      description: 'Sản phẩm cuối cùng chất lượng cao được bàn giao theo định dạng bạn yêu cầu, sẵn sàng sử dụng trên tất cả các kênh marketing của bạn',
      icon: 'CheckCircle2'
    }
  ]
}: WeWorkSectionProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    if (typeof window === 'undefined') return { circleSize: 500, buttonSize: 110, radius: 250 };

    const width = window.innerWidth;
    if (width < 480) {
      return { circleSize: 280, buttonSize: 60, radius: 140 };
    } else if (width < 768) {
      return { circleSize: 350, buttonSize: 75, radius: 175 };
    } else if (width < 1024) {
      return { circleSize: 400, buttonSize: 90, radius: 200 };
    }
    return { circleSize: 500, buttonSize: 110, radius: 250 };
  };

  // Calculate positions for step buttons around the circle
  const getStepPosition = (index: number, total: number) => {
    const { circleSize, buttonSize, radius } = getResponsiveDimensions();
    const angle = (index * 360) / total - 90; // Start from top
    const centerX = circleSize / 2; // Center X of the circle
    const centerY = circleSize / 2; // Center Y of the circle
    const x = centerX + radius * Math.cos((angle * Math.PI) / 180) - buttonSize / 2; // Center the button
    const y = centerY + radius * Math.sin((angle * Math.PI) / 180) - buttonSize / 2; // Center the button
    return { x, y };
  };

  const { circleSize, buttonSize } = getResponsiveDimensions();
  const ActiveIcon = getLucideIcon(steps[activeStep]?.icon);

  return (
    <section id="more" className="py-12 sm:py-16 md:py-20 bg-black text-white min-h-screen">
      <div className="container mx-auto px-4 max-w-[1140px]">
        {/* Grid Layout: Content + Circle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">

          {/* COL 1: CONTENT - Order 2 on mobile, 1 on desktop */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[61px] font-light mb-4 sm:mb-6 md:mb-8 text-white uppercase tracking-wide leading-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-[20px] font-light text-white leading-relaxed mb-6 sm:mb-8 md:mb-12">
              {subtitle}
            </p>
            <a
              href="#contact"
              className="inline-flex px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-2 border-[#FFD700] text-[#FFD700] uppercase font-medium rounded-lg hover:bg-[#FFD700] hover:text-black transition-all duration-300 text-xs sm:text-sm md:text-base min-h-[48px] items-center justify-center"
            >
              <span className="hidden sm:inline">Bắt đầu dự án của bạn ngay hôm nay</span>
              <span className="sm:hidden">Bắt đầu dự án ngay</span>
            </a>
          </div>

          {/* COL 2: CIRCLE WORKFLOW - Order 1 on mobile, 2 on desktop */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div
              className="relative mx-auto"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                minWidth: `${circleSize}px`,
                minHeight: `${circleSize}px`
              }}
            >
            {/* Main Center Circle */}
            <div
              className="absolute inset-0 rounded-full border-2 border-[#FFD700] bg-black flex flex-col justify-center items-center text-center p-4 sm:p-6 md:p-8 lg:p-12"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`
              }}
            >
              {/* Active Step Content */}
              <div className="mb-3 sm:mb-4 md:mb-6 text-[#FFD700] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                <ActiveIcon className="text-[#FFD700] text-2xl sm:text-3xl md:text-4xl lg:text-5xl" />
              </div>
              <h3 className="text-[#FFD700] text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl uppercase font-medium mb-3 sm:mb-4 md:mb-6 leading-tight px-2">
                {steps[activeStep]?.title || 'Step Title'}
              </h3>
              <p className="text-white font-light text-xs sm:text-sm md:text-base leading-relaxed px-2">
                {steps[activeStep]?.description || 'Step description'}
              </p>
            </div>

            {/* Step Buttons Around Circle */}
            {steps.map((step, index) => {
              const position = getStepPosition(index, steps.length);
              return (
                <button
                  key={index}
                  className={`absolute rounded-full border-2 border-[#FFD700] bg-black flex items-center justify-center text-white font-medium transition-all duration-300 hover:bg-[#FFD700] hover:text-black hover:scale-105 active:scale-95 ${
                    activeStep === index ? 'bg-[#FFD700] text-black' : ''
                  }`}
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: `${buttonSize}px`,
                    height: `${buttonSize}px`,
                    fontSize: buttonSize < 70 ? '10px' : buttonSize < 90 ? '12px' : '14px',
                    minHeight: '44px', // Minimum touch target size
                    minWidth: '44px'
                  }}
                  onClick={() => setActiveStep(index)}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                >
                  <span className="text-center leading-tight">
                    {buttonSize < 70 ? `${index + 1}` : `Step ${index + 1}`}
                  </span>
                </button>
              );
            })}

            {/* Hidden Content for Other Steps */}
            {steps.map((step, index) => {
              const StepIcon = getLucideIcon(step.icon);
              return (
                index !== activeStep && (
                  <div
                    key={`hidden-${index}`}
                    className="absolute inset-0 opacity-0 invisible"
                    style={{ transition: 'opacity 0.3s ease, visibility 0.3s ease' }}
                  >
                    <div className="w-full h-full flex flex-col justify-center items-center text-center p-4 sm:p-6 md:p-8 lg:p-12">
                      <div className="mb-3 sm:mb-4 md:mb-6 text-[#FFD700] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                        <StepIcon className="text-[#FFD700] text-2xl sm:text-3xl md:text-4xl lg:text-5xl" />
                      </div>
                      <h3 className="text-[#FFD700] text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl uppercase font-medium mb-3 sm:mb-4 md:mb-6 leading-tight px-2">
                        {step.title}
                      </h3>
                      <p className="text-white font-light text-xs sm:text-sm md:text-base leading-relaxed px-2">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              );
            })}
            </div>
          </div>
        </div>
      </div>



      {/* Custom Styles */}
      <style jsx>{`
        /* Smooth transitions for interactive elements */
        button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: manipulation; /* Improve touch responsiveness */
        }

        button:hover {
          transform: scale(1.05);
        }

        button:active {
          transform: scale(0.95);
        }

        /* Ensure proper font rendering */
        h2, h3 {
          font-family: inherit;
        }

        /* Improve text readability on mobile */
        @media (max-width: 640px) {
          h2 {
            line-height: 1.1 !important;
            word-break: break-word;
          }

          h3 {
            line-height: 1.2 !important;
            word-break: break-word;
          }

          p {
            line-height: 1.5 !important;
          }
        }

        /* Enhanced touch targets for mobile */
        @media (max-width: 768px) {
          button {
            min-height: 44px !important;
            min-width: 44px !important;
          }
        }

        /* Prevent text selection on buttons */
        button {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Smooth scrolling for mobile */
        @media (max-width: 768px) {
          section {
            scroll-behavior: smooth;
          }
        }

        /* Optimize for very small screens */
        @media (max-width: 320px) {
          .container {
            padding: 0 0.75rem !important;
          }
        }

        /* Landscape mobile optimization */
        @media (max-height: 600px) and (orientation: landscape) {
          section {
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
            min-height: auto !important;
          }
        }

        /* High DPI displays optimization */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          button {
            border-width: 1.5px;
          }
        }

        /* Focus states for accessibility */
        button:focus {
          outline: 2px solid #FFD700;
          outline-offset: 2px;
        }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          button {
            transition: none;
          }

          button:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
};

export default WeWorkSection;
