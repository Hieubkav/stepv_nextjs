'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/useSiteConfig';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { getSetting } = useSiteSettings();

  return (
    <footer className={`relative ${className}`}>
      {/* Main Footer Container with Full Width Dark Background */}
      <div className="w-full bg-black text-white">

        {/* 1. Welcome & CTA Section */}
        <div className="w-full py-20">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 text-center">
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin text-gray-300 leading-tight mb-8 tracking-wide uppercase">
              HÃY ĐỂ CHÚNG TÔI CHĂM SÓC BẠN
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white font-light leading-relaxed max-w-4xl mx-auto mb-12">
              {getSetting('site_description', 'Step V Studio – Đối tác của bạn cho các dự án hình ảnh 3D cao cấp, hoạt hình và giải pháp marketing. Hiện thực hóa tầm nhìn của bạn với độ chính xác, sáng tạo và đổi mới')}
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
        <div className="w-full py-16">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
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
                      href: getSetting('youtube_url', 'https://www.youtube.com/@dohystudio'),
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      )
                    },
                    {
                      name: 'TikTok',
                      href: getSetting('tiktok_url', 'https://www.tiktok.com/@dohystudio'),
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      )
                    },
                    {
                      name: 'Facebook',
                      href: getSetting('facebook_url', 'https://www.facebook.com/profile.php?id=61574798173124&sk=friends_likes'),
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      )
                    },
                    {
                      name: 'Instagram',
                      href: getSetting('instagram_url', 'https://www.instagram.com/dohy_studio/'),
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      )
                    },
                    {
                      name: 'Pinterest',
                      href: getSetting('pinterest_url'),
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.001 12.017.001z"/>
                        </svg>
                      )
                    },
                    {
                      name: 'X',
                      href: getSetting('x_url'),
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      )
                    }
                  ].filter(social => social.href).map((social, index) => (
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
                    {getSetting('contact_address', 'Stuttgart, Đức')}
                  </p>
                  <a
                    href={`tel:${getSetting('contact_phone', '+49-176-21129718')}`}
                    className="text-gray-300 hover:text-[#FFD700] footer-transition block"
                  >
                    {getSetting('contact_phone', '+49-176-21129718')}
                  </a>
                </div>
              </div>

              {/* Contact Column */}
              <div>
                <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
                  LIÊN HỆ
                </h3>
                <a
                  href={`mailto:${getSetting('contact_email', 'contact@stepv.studio')}`}
                  className="text-gray-300 hover:text-[#FFD700] footer-transition"
                >
                  {getSetting('contact_email', 'contact@stepv.studio')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Final Divider Line */}
        <div className="w-full h-px bg-white opacity-20"></div>

        {/* 4. Copyright Section */}
        <div className="w-full py-8">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
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
