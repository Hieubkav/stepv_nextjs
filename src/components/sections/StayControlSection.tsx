'use client';

interface Feature {
  title: string;
  description: string;
  icon_svg: string;
  width: string;
}

interface StayControlSectionProps {
  title?: string;
  description?: string;
  features?: Feature[];
  backgroundColor?: string;
  layout?: 'grid-2x2' | 'single-column' | 'custom';
}

const StayControlSection = ({
  title = 'Stay in Control with Your Client Dashboard',
  description = 'We\'ve made it easy for you to stay connected and in control!',
  features = [
    {
      title: 'Access All Your Files',
      description: 'Easily download your project files, deliverables, and revisions at any time, all in one secure location',
      icon_svg: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z',
      width: '40%'
    },
    {
      title: 'Track Your Project\'s Progress',
      description: 'Stay updated with real-time progress tracking, milestones, and deadlines, so you always know what\'s happening',
      icon_svg: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z',
      width: '60%'
    }
  ],
  backgroundColor = 'bg-black',
  layout = 'grid-2x2'
}: StayControlSectionProps) => {

  // Divide features into rows for grid-2x2 layout
  const featureRows = [];
  if (layout === 'grid-2x2') {
    for (let i = 0; i < features.length; i += 2) {
      featureRows.push(features.slice(i, i + 2));
    }
  } else if (layout === 'single-column') {
    // All features in 1 column
    featureRows.push(features.map(feature => ({ ...feature, width: '100%' })));
  } else {
    // Custom layout - keep original widths
    for (let i = 0; i < features.length; i += 2) {
      featureRows.push(features.slice(i, i + 2));
    }
  }

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
            
            {featureRows.map((featureRow, rowIndex) => (
              <div key={rowIndex} className="flex flex-col md:flex-row gap-5">
                {featureRow.map((feature, featureIndex) => (
                  <div 
                    key={featureIndex}
                    className={`${getWidthClass(feature.width)} flex flex-col gap-5 p-6 rounded-[25px] border-[0.8px] border-gray-700 bg-black shadow-2xl transition-all duration-300 hover:shadow-3xl hover:border-white/30`}
                    style={{ 
                      transform: 'matrix3d(0.998, -0.001, 0.061, 0, 0, 0.999, 0.019, 0, -0.061, -0.019, 0.997, 0, 0, 0, 0, 1)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <svg className="w-7 h-7 text-white flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d={feature.icon_svg} />
                      </svg>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

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
        }

        /* Card hover effects */
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.4);
        }

        .hover\\:border-white\\/30:hover {
          border-color: rgba(255, 255, 255, 0.3);
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
          will-change: transform, box-shadow, border-color;
        }
      `}</style>
    </div>
  );
};

export default StayControlSection;
