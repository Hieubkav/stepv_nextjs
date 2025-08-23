'use client';

import { Button } from "@/components/ui/button";

interface VideoItem {
  videoId: string;
  title: string;
  linkUrl?: string;
}

interface ButtonItem {
  text: string;
  url: string;
  style: 'primary' | 'secondary';
}

interface YourAdviceSectionProps {
  title?: string;
  subtitle?: string;
  buttons?: ButtonItem[];
  videos?: VideoItem[];
  desktopHeight?: number;
  mobileHeight?: number;
}

const YourAdviceSection = ({
  title = 'QUẢNG CÁO CỦA BẠN CÓ THỂ TRÔNG NHƯ THẾ NÀY',
  subtitle = 'Khám phá cách chúng tôi đã giúp các thương hiệu cao cấp và ngành công nghiệp sáng tạo biến tầm nhìn của họ thành hiện thực với những hình ảnh 3D tuyệt đẹp và được thiết kế riêng.',
  buttons = [
    { text: 'KHÁM PHÁ THÊM DỰ ÁN', url: '/projects', style: 'primary' },
    { text: 'LIÊN HỆ CHÚNG TÔI', url: '#contact', style: 'secondary' }
  ],
  videos = [
    { videoId: 'EZwwRmLAg90', title: 'Oro Bianco | BOIS 1920 | Step V Studio | 3D Animation', linkUrl: '/projects' },
    { videoId: 'M7lc1UVf-VE', title: '3D Product Animation - Perfume Bottle', linkUrl: '/projects' }
  ],
  mobileHeight = 400
}: YourAdviceSectionProps) => {

  const buttonStyles = {
    primary: 'border-white text-white hover:bg-white hover:text-black bg-transparent',
    secondary: 'border-white text-white hover:bg-white hover:text-black bg-transparent'
  };

  const handleVideoClick = (linkUrl?: string) => {
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };

  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">

          {/* Left Content */}
          <div className="space-y-8">
            {/* Main Heading */}
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {title}
              </h2>
            </div>

            {/* Subtitle */}
            <div>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
                {subtitle}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className={`${buttonStyles[button.style]} border-2 px-8 py-3 text-sm font-semibold tracking-wider transition-all duration-300 hover:scale-105 rounded-full uppercase`}
                  onClick={() => window.open(button.url, '_blank')}
                >
                  {button.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Right Content - Images Grid */}
          <div className="grid grid-cols-2 gap-4 h-[600px]">
            {videos.map((video, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl bg-gray-900 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                onClick={() => handleVideoClick(video.linkUrl)}
              >
                {/* Video Container */}
                <div className="relative w-full h-full video-container">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.videoId}?controls=0&rel=0&playsinline=1&cc_load_policy=0&enablejsapi=1&mute=1&autoplay=1&loop=1&playlist=${video.videoId}&start=1`}
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    title={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Video container styling */
        .video-container {
          height: 100% !important;
        }

        /* Responsive adjustments */
        @media (max-width: 1023px) {
          .grid.grid-cols-2 {
            grid-template-columns: 1fr;
            height: auto !important;
          }

          .video-container {
            height: ${mobileHeight}px !important;
          }
        }

        /* Smooth hover animations */
        .group {
          will-change: transform;
        }

        /* Custom button hover effects */
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }

        .hover\\:scale-\\[1\\.02\\]:hover {
          transform: scale(1.02);
        }

        /* Ensure videos fill container properly */
        .video-container iframe {
          border-radius: inherit;
        }
      `}</style>
    </section>
  );
};

export default YourAdviceSection;
