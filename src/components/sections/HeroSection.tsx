'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BrandLogo {
  url: string;
  alt: string;
}

interface HeroSectionProps {
  videoId?: string;
  videoStart?: number;
  videoEnd?: number;
  titleLines?: string[];
  subtitle?: string;
  brands?: BrandLogo[];
}

const HeroSection = ({
  videoId = 'GXppDZ0k2IM',
  videoStart = 2,
  videoEnd = 31,
  titleLines = ['TẠO RA.', 'THU HÚT.', 'CHUYỂN ĐỔI.'],
  subtitle = 'CHUYÊN GIA HÌNH ẢNH 3D CHO THƯƠNG HIỆU NƯỚC HOA & LÀM ĐẸP',
  brands = [
    { url: '/images/brands/brand-1.png', alt: 'Brand 1' },
    { url: '/images/brands/brand-2.png', alt: 'Brand 2' },
    { url: '/images/brands/brand-3.png', alt: 'Brand 3' },
    { url: '/images/brands/brand-4.png', alt: 'Brand 4' },
    { url: '/images/brands/brand-5.png', alt: 'Brand 5' },
    { url: '/images/brands/brand-6.png', alt: 'Brand 6' },
    { url: '/images/brands/brand-7.png', alt: 'Brand 7' },
    { url: '/images/brands/brand-8.png', alt: 'Brand 8' },
    { url: '/images/brands/brand-9.png', alt: 'Brand 9' },
    { url: '/images/brands/brand-10.png', alt: 'Brand 10' },
    { url: '/images/brands/brand-11.png', alt: 'Brand 11' },
    { url: '/images/brands/brand-12.png', alt: 'Brand 12' },
    { url: '/images/brands/brand-13.png', alt: 'Brand 13' },
    { url: '/images/brands/brand-14.png', alt: 'Brand 14' },
    { url: '/images/brands/brand-15.png', alt: 'Brand 15' },
    { url: '/images/brands/brand-16.png', alt: 'Brand 16' },
    { url: '/images/brands/brand-17.png', alt: 'Brand 17' },
    { url: '/images/brands/brand-18.png', alt: 'Brand 18' },
    { url: '/images/brands/brand-19.png', alt: 'Brand 19' },
  ]
}: HeroSectionProps) => {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Rotate title lines every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex((prev) => (prev + 1) % titleLines.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [titleLines.length]);

  const handleViewMore = () => {
    const element = document.querySelector('#services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookConsultation = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const videoSrc = `https://www.youtube-nocookie.com/embed/${videoId}?controls=0&rel=0&playsinline=1&cc_load_policy=0&enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=${videoId}&start=${videoStart}&end=${videoEnd}`;

  return (
    <section id="home" className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <div className="video-background relative w-full h-full">
          {!isVideoLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center z-20">
              <div className="text-white text-xl">Đang tải...</div>
            </div>
          )}
          <iframe
            id="hero-video"
            src={videoSrc}
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            title="Step V Studio Showreel"
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover"
            onLoad={() => setIsVideoLoaded(true)}
          />
        </div>
        <div className="absolute inset-0 bg-black/30 md:bg-black/40 z-10"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex-1 flex flex-col justify-between items-center px-4 py-8 md:py-16">
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="container mx-auto text-center max-w-6xl">
            {/* Main Title */}
            <div className="mb-6 md:mb-8 hero-heading">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-4 md:mb-6 tracking-wider text-white leading-[0.85] md:leading-none">
                <span className="animated-text-wrapper">
                  <span className="animated-text block transition-all duration-1000 ease-in-out transform">
                    {titleLines[currentTitleIndex]}
                  </span>
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <div className="mb-8 md:mb-12 hero-subtitle">
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-light text-white/90 uppercase tracking-[0.15em] md:tracking-[0.2em] max-w-4xl mx-auto leading-relaxed px-2">
                {subtitle}
              </h2>
            </div>
          </div>
        </div>

        {/* Action Buttons - Positioned at bottom */}
        <div className="w-full flex flex-col items-center mb-4 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-6 md:mb-8">
            <button
              onClick={handleViewMore}
              className="group flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white/20 backdrop-blur-md border border-white/40 rounded-full text-white font-medium uppercase tracking-wide transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 text-sm md:text-base w-full sm:w-auto max-w-xs shadow-lg"
            >
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              XEM THÊM
            </button>

            <button
              onClick={handleBookConsultation}
              className="group flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-yellow-600 hover:bg-yellow-500 rounded-full text-white font-medium uppercase tracking-wide transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-yellow-500/25 text-sm md:text-base w-full sm:w-auto max-w-xs"
            >
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-center">ĐẶT LỊCH TƯ VẤN MIỄN PHÍ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Brand Logos Scrolling Section */}
      <div className="relative z-30 w-full bg-black/25 md:bg-black/20 backdrop-blur-md py-8 md:py-8 lg:py-10 overflow-hidden">
        <div className="relative">
          {/* Scrolling container */}
          <div className="flex animate-scroll">
            {/* First set of logos */}
            {brands.map((brand, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 mx-8 md:mx-10 lg:mx-12 xl:mx-14"
              >
                <div className="h-16 md:h-20 lg:h-24 xl:h-28 w-auto flex items-center justify-center">
                  <Image
                    src={brand.url}
                    alt={brand.alt}
                    width={160}
                    height={100}
                    className="h-full w-auto object-contain filter brightness-0 invert opacity-70 md:opacity-70 hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {brands.map((brand, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 mx-8 md:mx-10 lg:mx-12 xl:mx-14"
              >
                <div className="h-16 md:h-20 lg:h-24 xl:h-28 w-auto flex items-center justify-center">
                  <Image
                    src={brand.url}
                    alt={brand.alt}
                    width={160}
                    height={100}
                    className="h-full w-auto object-contain filter brightness-0 invert opacity-70 md:opacity-70 hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .video-background iframe {
          object-fit: cover;
        }

        /* Scrolling animation for brand logos */
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 35s linear infinite;
          width: 200%;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          #home {
            min-height: 100vh;
            min-height: 100dvh; /* Dynamic viewport height for mobile */
          }

          .video-background iframe {
            width: 100vw !important;
            height: 100vh !important;
            height: 100dvh !important;
            min-width: 100vw !important;
            min-height: 100vh !important;
            min-height: 100dvh !important;
            object-fit: cover;
          }

          .hero-heading h1 {
            font-size: 3.5rem !important;
            line-height: 0.85 !important;
            margin-bottom: 1rem !important;
          }

          .hero-subtitle h2 {
            font-size: 0.875rem !important;
            letter-spacing: 0.15em !important;
            line-height: 1.4 !important;
            margin-bottom: 2rem !important;
          }

          .animate-scroll {
            animation: scroll 25s linear infinite;
          }

          /* Ensure content doesn't overflow */
          .container {
            max-width: 100%;
            padding-left: 1rem;
            padding-right: 1rem;
          }

          /* Button adjustments for mobile - make them more prominent */
          button {
            font-size: 0.875rem !important;
            padding: 0.875rem 1.75rem !important;
            backdrop-filter: blur(12px) !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
          }

          /* Brand logos bigger on mobile */
          .h-16 {
            height: 4rem !important; /* 64px - even bigger on mobile */
          }

          /* Better spacing for mobile logos */
          .mx-8 {
            margin-left: 2rem !important;
            margin-right: 2rem !important;
          }
        }

        @media (max-width: 640px) {
          .hero-heading h1 {
            font-size: 2.75rem !important;
            line-height: 0.8 !important;
          }

          .hero-subtitle h2 {
            font-size: 0.75rem !important;
            letter-spacing: 0.1em !important;
          }

          button {
            font-size: 0.8rem !important;
            padding: 0.75rem 1.5rem !important;
            min-height: 48px !important; /* Touch-friendly size */
          }

          .animate-scroll {
            animation: scroll 20s linear infinite;
          }

          /* Maintain good size on small mobile */
          .h-16 {
            height: 3.5rem !important; /* 56px - still prominent */
          }
        }

        @media (max-width: 480px) {
          .hero-heading h1 {
            font-size: 2.25rem !important;
          }

          .hero-subtitle h2 {
            font-size: 0.7rem !important;
          }
        }

        /* Landscape mobile optimization */
        @media (max-height: 500px) and (orientation: landscape) {
          .hero-heading h1 {
            font-size: 2rem !important;
            margin-bottom: 0.5rem !important;
          }

          .hero-subtitle h2 {
            font-size: 0.7rem !important;
            margin-bottom: 1rem !important;
          }

          .flex-1 {
            padding-top: 1rem !important;
            padding-bottom: 0.5rem !important;
          }

          /* Smaller logos in landscape but still visible */
          .h-16 {
            height: 2.5rem !important; /* 40px - compact but visible */
          }

          /* Compact buttons in landscape */
          button {
            padding: 0.5rem 1rem !important;
            font-size: 0.75rem !important;
          }
        }

        /* Animated text styles */
        .animated-text-wrapper {
          position: relative;
          overflow: hidden;
        }

        .animated-text {
          opacity: 1;
          transform: translateY(0);
          animation: slideInUp 1s ease-out;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Button hover effects */
        button {
          position: relative;
          overflow: hidden;
        }

        button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }

        button:hover::before {
          left: 100%;
        }

        /* Pause animation on hover */
        .animate-scroll:hover {
          animation-play-state: paused;
        }

        /* Ensure video covers properly on all devices */
        .video-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        /* Fix for iOS Safari viewport issues */
        @supports (-webkit-touch-callout: none) {
          #home {
            min-height: -webkit-fill-available;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
