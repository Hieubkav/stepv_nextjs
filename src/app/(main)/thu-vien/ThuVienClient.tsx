'use client';

import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function ThuVienClient() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Tính toán thời gian đếm ngược (30 ngày từ bây giờ)
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30); // 30 ngày từ bây giờ

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background với gradient và hiệu ứng */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-32">
        <div className="text-center max-w-6xl mx-auto">
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-[60px] font-semibold text-white uppercase tracking-wider mb-16 md:mb-20 lg:mb-24 animate-fade-in">
            <span className="inline-block">ĐIỀU GÌ ĐÓ</span>
            <br />
            <span className="inline-block">THẬT ĐẶC BIỆT</span>
            <br />
            <span className="inline-block text-yellow-400">SẮP RA MẮT</span>
          </h1>

          {/* Countdown Timer */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12 mb-16 md:mb-20">
            
            {/* Days */}
            <div className="text-center">
              <div className="text-[50px] md:text-[60px] lg:text-[69px] font-bold text-white leading-none mb-2 countdown-number">
                {formatNumber(timeLeft.days)}
              </div>
              <div className="text-[16px] md:text-[18px] lg:text-[20px] font-light text-yellow-400 uppercase tracking-wider animate-glow-yellow">
                NGÀY
              </div>
            </div>

            {/* Separator */}
            <div className="text-[40px] md:text-[50px] lg:text-[60px] font-bold text-white/50 hidden sm:block">
              :
            </div>

            {/* Hours */}
            <div className="text-center">
              <div className="text-[50px] md:text-[60px] lg:text-[69px] font-bold text-white leading-none mb-2 countdown-number">
                {formatNumber(timeLeft.hours)}
              </div>
              <div className="text-[16px] md:text-[18px] lg:text-[20px] font-light text-yellow-400 uppercase tracking-wider animate-glow-yellow">
                GIỜ
              </div>
            </div>

            {/* Separator */}
            <div className="text-[40px] md:text-[50px] lg:text-[60px] font-bold text-white/50 hidden sm:block">
              :
            </div>

            {/* Minutes */}
            <div className="text-center">
              <div className="text-[50px] md:text-[60px] lg:text-[69px] font-bold text-white leading-none mb-2 countdown-number">
                {formatNumber(timeLeft.minutes)}
              </div>
              <div className="text-[16px] md:text-[18px] lg:text-[20px] font-light text-yellow-400 uppercase tracking-wider animate-glow-yellow">
                PHÚT
              </div>
            </div>

            {/* Separator */}
            <div className="text-[40px] md:text-[50px] lg:text-[60px] font-bold text-white/50 hidden sm:block">
              :
            </div>

            {/* Seconds */}
            <div className="text-center">
              <div className="text-[50px] md:text-[60px] lg:text-[69px] font-bold text-white leading-none mb-2 countdown-number">
                {formatNumber(timeLeft.seconds)}
              </div>
              <div className="text-[16px] md:text-[18px] lg:text-[20px] font-light text-yellow-400 uppercase tracking-wider animate-glow-yellow">
                GIÂY
              </div>
            </div>

          </div>

          {/* Optional subtitle */}
          <div className="animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Chúng tôi đang chuẩn bị một{' '}
              <span className="text-yellow-400 font-medium">thư viện tài nguyên</span> đặc biệt
              với những nội dung sáng tạo tuyệt vời. Hãy đón chờ!
            </p>
          </div>

          {/* Email notification signup */}
          <div className="mt-12 md:mt-16 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
            <div className="max-w-md mx-auto">
              <p className="text-sm text-gray-400 mb-4">
                Đăng ký để nhận thông báo khi thư viện ra mắt
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all duration-300 hover:bg-white/15"
                />
                <button className="px-6 py-3 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300 whitespace-nowrap shadow-lg hover:shadow-yellow-400/25">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Particles với màu vàng */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping delay-2000 opacity-60"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-3000"></div>
        <div className="absolute bottom-1/3 right-2/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-4000 opacity-50"></div>
      </div>

      {/* Decorative gradient bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
    </main>
  );
}
