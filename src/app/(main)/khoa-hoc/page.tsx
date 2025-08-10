import React from 'react';
import CountdownTimer from '@/components/ui/CountdownTimer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Khóa học - Step V Studio',
  description: 'Khóa học 3D Animation và Product Visualization sắp ra mắt tại Step V Studio. Đăng ký để nhận thông báo sớm nhất.',
  keywords: 'khóa học 3D, animation, product visualization, Step V Studio, coming soon',
};

export default function KhoaHocPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content Container - Thêm padding-top để tránh chồng lấp với navbar */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-32">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Headline - Thay đổi text thành tiếng Việt */}
          <h1 className="text-4xl md:text-5xl lg:text-[60px] font-semibold text-white uppercase tracking-wider mb-12 md:mb-16 lg:mb-20 animate-fade-in animate-glow-yellow">
            <span className="inline-block">ĐIỀU GÌ ĐÓ</span>
            <br className="sm:hidden" />
            <span className="inline-block"> THẬT ĐẶC BIỆT</span>
            <br />
            <span className="inline-block text-yellow-400">SẮP RA MẮT</span>
          </h1>

          {/* Countdown Timer - Sử dụng chế độ thông minh */}
          <div className="mb-8">
            <CountdownTimer
              smartMode={true}
              className="justify-center"
            />
          </div>

          {/* Optional subtitle or description */}
          <div className="mt-12 md:mt-16 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Chúng tôi đang chuẩn bị những khóa học đặc biệt về{' '}
              <span className="text-yellow-400 font-medium">3D Animation</span> và{' '}
              <span className="text-yellow-400 font-medium">Product Visualization</span>.
              Hãy đón chờ những trải nghiệm học tập tuyệt vời sắp tới!
            </p>
          </div>

          {/* Email notification signup (optional) */}
          <div className="mt-12 md:mt-16 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
            <div className="max-w-md mx-auto">
              <p className="text-sm text-gray-400 mb-4">
                Đăng ký để nhận thông báo khi khóa học ra mắt
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

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping delay-2000 opacity-60"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-3000"></div>
        <div className="absolute bottom-1/3 right-2/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-4000 opacity-50"></div>
      </div>

      {/* Decorative elements (optional) */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
    </main>
  );
}
