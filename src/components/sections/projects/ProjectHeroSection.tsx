'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const ProjectHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 7 slides với hình ảnh thật từ Step V Studio portfolio
  const slides = [
    '/images/projects/hero/hero-1.png',
    '/images/projects/hero/hero-2.png',
    '/images/projects/hero/hero-3.jpg',
    '/images/projects/hero/hero-4.png',
    '/images/projects/hero/hero-5.png',
    '/images/projects/hero/hero-6.png',
    '/images/projects/hero/hero-7.png',
  ];

  // Auto-slide với cross-fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Chuyển slide mỗi 5 giây để thưởng thức portfolio

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Slider với Ken Burns effect */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={slide}
                alt={`Step V Studio portfolio project ${index + 1} - 3D visualization and animation work`}
                fill
                className="object-cover animate-ken-burns"
                priority={index === 0}
                quality={90}
                sizes="100vw"
              />
              {/* Dark cinematic overlay with gradient for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
              {/* Vignette effect for cinematic feel */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Container - Chia 2 cột với responsive padding-top để tránh navbar */}
      <div className="relative z-10 h-full flex items-center pt-20 md:pt-24 lg:pt-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
            {/* Cột trái - Để trống cho ảnh nền */}
            <div className="hidden lg:block"></div>

            {/* Cột phải - Nội dung chính với responsive spacing */}
            <div className="text-white space-y-6 md:space-y-8 lg:pl-12 px-4 md:px-0">
              {/* Tiêu đề lớn với responsive typography */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light uppercase tracking-wider leading-tight">
                <span className="block">CHÚNG TÔI TẠO RA</span>
                <span className="block">NHIỀU HƠN CHỈ LÀ</span>
                <span className="block">HÌNH ẢNH 3D</span>
                <span className="block text-yellow-400">TRỰC QUAN.</span>
              </h1>

              {/* Mô tả với responsive text size */}
              <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-lg leading-relaxed">
                Biến tầm nhìn thương hiệu của bạn thành hiện thực với những hình ảnh sống động và ấn tượng.
              </p>

              {/* Social Media Icons */}
              <div className="flex space-x-6">
                <a
                  href="https://www.youtube.com/@dohystudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
                  aria-label="YouTube"
                >
                  <i className="fab fa-youtube text-2xl"></i>
                </a>
                <a
                  href="https://www.tiktok.com/@dohystudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
                  aria-label="TikTok"
                >
                  <i className="fab fa-tiktok text-2xl"></i>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61574798173124&sk=friends_likes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook text-2xl"></i>
                </a>
                <a
                  href="https://www.instagram.com/dohy_studio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram text-2xl"></i>
                </a>
              </div>

              {/* CTA Button với responsive spacing */}
              <div className="pt-2 md:pt-4">
                <button className="bg-white text-black px-6 py-3 md:px-8 md:py-4 uppercase font-semibold tracking-wider hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg text-sm md:text-base">
                  ĐẶT LỊCH TƯ VẤN MIỄN PHÍ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators - Ẩn để tránh conflict với CTA button */}
      {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div> */}
    </section>
  );
};

export default ProjectHeroSection;
