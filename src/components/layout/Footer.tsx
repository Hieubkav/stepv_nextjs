import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`relative ${className}`}>
      {/* Main Footer Container with Gradient Background and Rounded Top Corners */}
      <div className="footer-gradient rounded-t-[45px] text-white">

        {/* 1. Welcome & CTA Section */}
        <div className="px-8 lg:px-16 pt-20 pb-16">
          <div className="max-w-7xl mx-auto text-center">
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin text-gray-300 leading-tight mb-8 tracking-wide uppercase">
              HÃY ĐỂ CHÚNG TÔI CHĂM SÓC BẠN
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white font-light leading-relaxed max-w-4xl mx-auto mb-12">
              Step V Studio – Đối tác của bạn cho các dự án hình ảnh 3D cao cấp, hoạt hình và giải pháp marketing.
              Hiện thực hóa tầm nhìn của bạn với độ chính xác, sáng tạo và đổi mới
            </p>

            {/* CTA Button */}
            <Button className="bg-gradient-to-r from-gray-800 to-gray-900 text-[#FFD700] hover:from-gray-700 hover:to-gray-800 px-12 py-4 rounded-lg font-medium tracking-wide uppercase footer-transition text-lg border border-gray-700">
              ĐẶT LỊCH HẸN
            </Button>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-full h-px bg-white opacity-20"></div>

        {/* 2. Sitemap Section */}
        <div className="px-8 lg:px-16 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

              {/* Our Studio Column */}
              <div>
                <div className="mb-8">
                  <Image
                    src="/images/logo.png"
                    alt="Step V Studio"
                    width={80}
                    height={80}
                    className="h-20 w-auto mb-6"
                  />
                </div>
                <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
                  STUDIO CỦA CHÚNG TÔI
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/" className="text-[#FFD700] hover:underline footer-transition">
                      Trang chủ
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-gray-300 hover:text-white footer-transition">
                      Giới thiệu
                    </Link>
                  </li>
                  <li>
                    <Link href="/services" className="text-gray-300 hover:text-white footer-transition">
                      Dịch vụ
                    </Link>
                  </li>
                  <li>
                    <Link href="/jobs" className="text-gray-300 hover:text-white footer-transition">
                      Tuyển dụng
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Our Services Column */}
              <div>
                <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
                  DỊCH VỤ CỦA CHÚNG TÔI
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/services/marketing" className="text-gray-300 hover:text-white footer-transition">
                      Marketing
                    </Link>
                  </li>
                  <li>
                    <Link href="/services/architectural-visualization" className="text-gray-300 hover:text-white footer-transition">
                      Hình ảnh kiến trúc
                    </Link>
                  </li>
                  <li>
                    <Link href="/services/product-visualization" className="text-gray-300 hover:text-white footer-transition">
                      Hình ảnh sản phẩm
                    </Link>
                  </li>
                  <li>
                    <Link href="/services/animation" className="text-gray-300 hover:text-white footer-transition">
                      Hoạt hình 3D
                    </Link>
                  </li>
                </ul>
              </div>

              {/* General Terms Column */}
              <div>
                <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
                  ĐIỀU KHOẢN CHUNG
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/terms" className="text-gray-300 hover:text-white footer-transition">
                      Điều khoản sử dụng
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-gray-300 hover:text-white footer-transition">
                      Chính sách bảo mật
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-full h-px bg-white opacity-20"></div>

        {/* 3. Additional Information Section */}
        <div className="px-8 lg:px-16 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

              {/* Follow Us Column */}
              <div>
                <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
                  THEO DÕI CHÚNG TÔI
                </h3>
                <div className="flex space-x-4">
                  {[
                    {
                      name: 'YouTube',
                      href: 'https://youtube.com/@stepvstudio',
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      )
                    },
                    {
                      name: 'Instagram',
                      href: 'https://instagram.com/stepvstudio',
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      )
                    },
                    {
                      name: 'LinkedIn',
                      href: 'https://linkedin.com/company/stepvstudio',
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      )
                    }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center footer-transition hover:border-[#FFD700] hover:bg-gray-700 group"
                      title={social.name}
                    >
                      <div className="text-[#FFD700] group-hover:scale-110 footer-transition">
                        {social.icon}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Based In Column */}
              <div>
                <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
                  TRỤ SỞ TẠI
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-300">
                    Stuttgart, Đức
                  </p>
                  <a
                    href="tel:+49-176-21129718"
                    className="text-gray-300 hover:text-[#FFD700] footer-transition block"
                  >
                    +49-176-21129718
                  </a>
                </div>
              </div>

              {/* Contact Column */}
              <div>
                <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
                  LIÊN HỆ
                </h3>
                <a
                  href="mailto:contact@stepv.studio"
                  className="text-gray-300 hover:text-[#FFD700] footer-transition"
                >
                  contact@stepv.studio
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Final Divider Line */}
        <div className="w-full h-px bg-white opacity-20"></div>

        {/* 4. Copyright Section */}
        <div className="px-8 lg:px-16 py-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-white text-sm">
              © Bản quyền 2025 - Step V Studio. Tất cả quyền được bảo lưu
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
