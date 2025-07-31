'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MenuItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { label: 'TRANG CHỦ', href: '/', isActive: true },
    { label: 'KHÓA HỌC', href: '#contact' },
    { label: 'DỰ ÁN', href: '#projects' },
    { label: 'VỀ CHÚNG TÔI', href: '#about' },
    { label: 'THƯ VIỆN', href: '#jobs' },
    { label: 'THÊM', href: '#more' }
  ];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      {/* Top Header */}
      <header
        id="header-top"
        className={`font-sans absolute top-0 left-0 w-full z-40 transition-opacity duration-300 ${className}`}
      >
        <div className="flex items-center justify-between gap-2 w-full min-h-[110px] px-6 bg-black/30 backdrop-blur-sm border-b border-white/80">
          {/* Logo */}
          <div className="w-1/5 flex-shrink-0">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Step V Studio"
                width={80}
                height={80}
                className="h-20 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex justify-center flex-1 max-w-3xl mx-4">
            <ul className="flex items-center justify-center space-x-1 w-full">
              {menuItems.map((item, index) => (
                <li key={index} className="flex-shrink-0">
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith('#')) {
                        e.preventDefault();
                        handleLinkClick(item.href);
                      }
                    }}
                    className={`px-3 py-2 uppercase font-semibold text-sm whitespace-nowrap transition-colors ${
                      item.isActive
                        ? 'text-white border-b-2 border-white'
                        : 'text-white hover:text-gray-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side - Contact Button, Social Icons & Mobile Menu */}
          <div className="flex items-center justify-end w-1/5 flex-shrink-0 gap-3">
            {/* Social Icons */}
            <div className="hidden lg:flex items-center gap-2">
              {[
                { icon: 'fab fa-youtube', href: 'https://youtube.com/@stepvstudio', color: 'text-red-500' },
                { icon: 'fab fa-instagram', href: 'https://instagram.com/stepvstudio', color: 'text-pink-500' },
                { icon: 'fab fa-linkedin', href: 'https://linkedin.com/company/stepvstudio', color: 'text-blue-500' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-8 h-8 ${social.color} hover:scale-110 transition-all duration-300 flex items-center justify-center`}
                >
                  <i className={`${social.icon} text-lg`}></i>
                </a>
              ))}
            </div>

            <Link
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('#contact');
              }}
              className="hidden lg:inline-block uppercase text-xs font-semibold text-black bg-white rounded-full px-6 py-3 transition-transform hover:scale-105"
            >
              Liên Hệ
            </Link>
            <button
              onClick={handleMobileMenuToggle}
              className="lg:hidden text-white text-2xl focus:outline-none"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Header */}
      <header
        id="header-sticky"
        className={`font-sans fixed top-4 left-1/2 -translate-x-1/2 w-[96%] z-50 transition-all duration-500 ease-in-out ${
          isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0'
        }`}
      >
        <div className="flex items-center justify-between gap-2 w-full h-[100px] px-8 bg-black/50 backdrop-blur-lg rounded-full shadow-2xl shadow-black/30">
          {/* Logo */}
          <div className="w-1/5 flex-shrink-0">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Step V Studio"
                width={64}
                height={64}
                className="h-16 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex justify-center flex-1 max-w-3xl mx-4">
            <ul className="flex items-center justify-center space-x-1 w-full">
              {menuItems.map((item, index) => (
                <li key={index} className="flex-shrink-0">
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith('#')) {
                        e.preventDefault();
                        handleLinkClick(item.href);
                      }
                    }}
                    className={`px-3 py-2 uppercase font-semibold text-sm whitespace-nowrap transition-colors ${
                      item.isActive
                        ? 'text-white border-b-2 border-white'
                        : 'text-white hover:text-gray-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side - Contact Button, Social Icons & Mobile Menu */}
          <div className="flex items-center justify-end w-1/5 flex-shrink-0 gap-3">
            {/* Social Icons */}
            <div className="hidden lg:flex items-center gap-2">
              {[
                { icon: 'fab fa-youtube', href: 'https://youtube.com/@stepvstudio', color: 'text-red-500' },
                { icon: 'fab fa-instagram', href: 'https://instagram.com/stepvstudio', color: 'text-pink-500' },
                { icon: 'fab fa-linkedin', href: 'https://linkedin.com/company/stepvstudio', color: 'text-blue-500' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-8 h-8 ${social.color} hover:scale-110 transition-all duration-300 flex items-center justify-center`}
                >
                  <i className={`${social.icon} text-lg`}></i>
                </a>
              ))}
            </div>

            <Link
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('#contact');
              }}
              className="hidden lg:inline-block uppercase text-xs font-semibold text-black bg-white rounded-full px-6 py-3 transition-transform hover:scale-105"
            >
              Liên Hệ
            </Link>
            <button
              onClick={handleMobileMenuToggle}
              className="lg:hidden text-white text-2xl focus:outline-none"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleMobileMenuToggle}
        ></div>
        <div className={`absolute right-0 top-0 h-full w-80 bg-black/95 backdrop-blur-lg shadow-2xl transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <Image
              src="/images/logo.png"
              alt="Step V Studio"
              width={48}
              height={48}
              className="h-12 w-auto"
              priority
            />
            <button
              onClick={handleMobileMenuToggle}
              className="text-white text-2xl focus:outline-none"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="p-6">
            <ul className="space-y-4">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith('#')) {
                        e.preventDefault();
                        handleLinkClick(item.href);
                      } else {
                        setIsMobileMenuOpen(false);
                        document.body.style.overflow = '';
                      }
                    }}
                    className={`block px-4 py-3 uppercase font-semibold text-sm transition-colors rounded-lg ${
                      item.isActive
                        ? 'text-black bg-white'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Contact Button */}
            <div className="mt-8">
              <Link
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('#contact');
                }}
                className="block w-full text-center uppercase text-sm font-semibold text-black bg-white rounded-full px-6 py-3 transition-transform hover:scale-105"
              >
                Liên Hệ
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-8 justify-center">
              {[
                { icon: 'fab fa-youtube', href: '#' },
                { icon: 'fab fa-instagram', href: '#' },
                { icon: 'fab fa-linkedin', href: '#' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
                >
                  <i className={`${social.icon} text-white text-lg`}></i>
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Ensure smooth transitions */
        .transition-all {
          will-change: transform, opacity;
        }

        /* Mobile menu animations */
        #mobile-menu {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        /* Navbar blur effects */
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .backdrop-blur-lg {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .w-1\\/5 {
            width: auto;
          }

          .flex-1 {
            display: none;
          }
        }

        /* Additional responsive breakpoints for navigation */
        @media (min-width: 1024px) and (max-width: 1280px) {
          .max-w-3xl {
            max-width: 42rem; /* Slightly smaller for medium screens */
          }

          /* Tighter spacing for medium screens */
          .space-x-1 > :not([hidden]) ~ :not([hidden]) {
            margin-left: 0.125rem; /* 2px */
          }
        }

        @media (min-width: 1280px) {
          .max-w-3xl {
            max-width: 48rem; /* Full width for large screens */
          }

          /* Normal spacing for large screens */
          .space-x-1 > :not([hidden]) ~ :not([hidden]) {
            margin-left: 0.25rem; /* 4px */
          }
        }

        /* Ensure navigation items never wrap */
        nav ul {
          flex-wrap: nowrap;
          overflow: hidden;
        }

        nav ul li {
          flex-shrink: 0;
          min-width: fit-content;
        }
      `}</style>
    </>
  );
};

export default Header;
