'use client';

interface Feature {
  title: string;
  description: string;
  icon_svg: string;
  width: string;
  row: number;
}

interface StayControlSectionProps {
  title?: string;
  description?: string;
  features?: Feature[];
  backgroundColor?: string;
  layout?: 'grid-2x2' | 'single-column' | 'custom';
}

const StayControlSection = ({
  title = 'Kiểm Soát Hoàn Toàn với Bảng Điều Khiển Khách Hàng',
  description = 'Chúng tôi đã giúp bạn dễ dàng kết nối và kiểm soát mọi thứ!',
  features = [
    {
      title: 'Truy Cập Tất Cả File Của Bạn',
      description: 'Dễ dàng tải xuống các file dự án, sản phẩm bàn giao và phiên bản sửa đổi bất cứ lúc nào, tất cả trong một vị trí bảo mật',
      icon_svg: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z',
      width: '40%',
      row: 1
    },
    {
      title: 'Theo Dõi Tiến Độ Dự Án',
      description: 'Cập nhật theo thời gian thực về tiến độ, cột mốc và thời hạn, để bạn luôn biết điều gì đang diễn ra',
      icon_svg: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z',
      width: '60%',
      row: 1
    },
    {
      title: 'Giao Tiếp Dễ Dàng',
      description: 'Sử dụng bảng điều khiển để gửi phản hồi, đặt câu hỏi hoặc liên lạc với đội ngũ của chúng tôi—không cần chuỗi email dài dằng dặc',
      icon_svg: 'M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9V7H18V9H6M14,11V13H6V11H14M16,15V13H18V15H16Z',
      width: '60%',
      row: 2
    },
    {
      title: 'Tổ Chức Tốt Cho Dự Án Tương Lai',
      description: 'Bảng điều khiển của bạn hoạt động như một kho lưu trữ dài hạn, để bạn có thể xem lại các dự án cũ hoặc bắt đầu dự án mới mà không mất bất kỳ thông tin nào',
      icon_svg: 'M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19M16.5,16L13.5,12.5L11,15.5L8.5,12.5L5.5,16H16.5Z',
      width: '40%',
      row: 2
    }
  ],
  backgroundColor = 'bg-black',
  layout = 'grid-2x2'
}: StayControlSectionProps) => {

  // Group features by row
  const featureRows = [];
  const row1Features = features.filter(f => f.row === 1);
  const row2Features = features.filter(f => f.row === 2);
  
  if (row1Features.length > 0) featureRows.push(row1Features);
  if (row2Features.length > 0) featureRows.push(row2Features);

  // Convert width percentages to Tailwind classes
  const getWidthClass = (width: string) => {
    switch(width) {
      case '40%': return 'w-full md:w-[40%]';
      case '60%': return 'w-full md:w-[60%]';
      case '50%': return 'w-full md:w-1/2';
      case '100%': return 'w-full';
      default: return 'w-full md:w-1/2';
    }
  };

  return (
    <div className={`${backgroundColor} flex flex-col items-center w-full text-left py-20 box-border`}>
      <div className="w-full max-w-[1140px] px-4">

        {/* CLIENT DASHBOARD SECTION */}
        <div className="w-full flex flex-col p-4 lg:p-[25px] gap-5 box-border">
          <div className="w-full">
            {/* Title */}
            <div className="mb-[30px] text-left">
              <h2 className="text-white font-light uppercase text-5xl lg:text-[60.8px] lg:leading-[60.8px]">
                {title}
              </h2>
            </div>
            {/* Description */}
            <div className="w-full lg:w-[60%] text-left">
              <p className="text-white font-light text-xl leading-[35px]" style={{ textShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
                {description}
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="w-full flex flex-col gap-5 mt-10 mb-[10%]" style={{ perspective: '1200px' }}>
            
            {featureRows.map((featureRow, rowIndex) => {
              const isFirstRow = rowIndex === 0;
              const gradientDirection = isFirstRow 
                ? 'linear-gradient(to bottom, #000000 0%, #333333 100%)' 
                : 'linear-gradient(to bottom, #333333 0%, #000000 100%)';
              
              return (
                <div key={rowIndex} className="flex flex-col md:flex-row gap-5">
                  {featureRow.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex}
                      className={`${getWidthClass(feature.width)} flex flex-col justify-start p-8 rounded-[25px] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
                      style={{ 
                        background: gradientDirection,
                        transform: 'matrix3d(0.998, -0.001, 0.061, 0, 0, 0.999, 0.019, 0, -0.061, -0.019, 0.997, 0, 0, 0, 0, 1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      <div className="flex flex-col gap-6">
                        <div className="flex justify-start">
                          <svg className="w-7 h-7" fill="#FFD700" viewBox="0 0 24 24">
                            <path d={feature.icon_svg} />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-[28px] leading-tight mb-4 uppercase">
                            {feature.title}
                          </h3>
                          <p className="text-[#d2d2d2] font-light text-[20px] leading-relaxed" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

          </div>
        </div>

      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .text-5xl {
            font-size: 2.5rem !important;
          }
          
          .lg\\:text-\\[60\\.8px\\] {
            font-size: 2.5rem !important;
            line-height: 2.5rem !important;
          }
          
          .lg\\:w-\\[60\\%\\] {
            width: 100% !important;
          }
          
          .md\\:w-\\[40\\%\\] {
            width: 100% !important;
          }
          
          .md\\:w-\\[60\\%\\] {
            width: 100% !important;
          }
          
          .md\\:flex-row {
            flex-direction: column !important;
          }

          .text-\\[28px\\] {
            font-size: 24px !important;
          }

          .text-\\[20px\\] {
            font-size: 18px !important;
          }
        }

        /* Enhanced 3D effects */
        .hover\\:scale-\\[1\\.02\\]:hover {
          transform: matrix3d(1.018, -0.001, 0.062, 0, 0, 1.019, 0.019, 0, -0.062, -0.019, 1.017, 0, 0, 0, 0, 1);
        }

        .hover\\:shadow-2xl:hover {
          box-shadow: 0 35px 70px -12px rgba(0, 0, 0, 0.6);
        }

        /* 3D perspective effect */
        .perspective-1200 {
          perspective: 1200px;
        }

        /* Text shadow utility */
        .text-shadow {
          text-shadow: 0 0 10px rgba(0,0,0,0.3);
        }

        /* Smooth transitions */
        .transition-all {
          will-change: transform, box-shadow, scale;
        }

        /* Neon green accent color */
        .text-neon-green {
          color: #d0ff71;
        }

        /* Enhanced gradient backgrounds */
        .gradient-row-1 {
          background: linear-gradient(to bottom, #000000 0%, #333333 100%);
        }

        .gradient-row-2 {
          background: linear-gradient(to bottom, #333333 0%, #000000 100%);
        }
      `}</style>
    </div>
  );
};

export default StayControlSection;